import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FlaskConical,
  Loader2,
  Play,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  FileCode2,
  RotateCcw,
  AlertTriangle,
  WifiOff,
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface TestCase {
  name: string;
  fullName: string;
  status: "pass" | "fail" | "skip";
  durationMs: number;
  error?: string;
}

interface TestFile {
  file: string;
  status: "pass" | "fail";
  durationMs: number;
  tests: TestCase[];
}

interface TestResult {
  timestamp: string;
  durationMs: number;
  status: "pass" | "fail" | "error";
  summary: { total: number; passed: number; failed: number; skipped: number };
  testFiles: TestFile[];
  errorOutput?: string;
  rawOutput?: string;
}

interface LastTestResponse {
  running: boolean;
  result: TestResult | null;
}

interface LiveFileProgress {
  file: string;
  status: "pass" | "fail";
  testCount: number;
  duration: string;
  index: number;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return ms + "ms";
  if (ms < 60000) return (ms / 1000).toFixed(1) + "s";
  return (ms / 60000).toFixed(1) + "m";
}

function ElapsedTimer({ running }: { running: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!running) {
      setElapsed(0);
      return;
    }
    startRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Date.now() - startRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  if (!running) return null;

  const secs = Math.floor(elapsed / 1000);
  const mins = Math.floor(secs / 60);
  const display = mins > 0 ? `${mins}m ${secs % 60}s` : `${secs}s`;

  return (
    <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid="text-elapsed">
      <Clock className="w-3 h-3" />
      {display}
    </span>
  );
}

function StatusIcon({ status }: { status: "pass" | "fail" | "skip" | "error" }) {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />;
    case "fail":
      return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />;
    case "skip":
      return <MinusCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" />;
    case "error":
      return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />;
  }
}

function groupByDirectory(files: TestFile[]): Record<string, TestFile[]> {
  const groups: Record<string, TestFile[]> = {};
  for (const f of files) {
    const parts = f.file.split("/");
    const dir = parts.length > 1 ? parts.slice(0, -1).join("/") : ".";
    if (!groups[dir]) groups[dir] = [];
    groups[dir].push(f);
  }
  return groups;
}

export default function TestsPage() {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [liveResult, setLiveResult] = useState<TestResult | null>(null);
  const [liveFiles, setLiveFiles] = useState<LiveFileProgress[]>([]);
  const [progressLines, setProgressLines] = useState<string[]>([]);
  const [runError, setRunError] = useState<string | null>(null);
  const [connectionLost, setConnectionLost] = useState(false);
  const liveResultRef = useRef<TestResult | null>(null);
  const lastEventTimeRef = useRef<number>(Date.now());

  const { data, isLoading } = useQuery<LastTestResponse>({
    queryKey: ["/api/tests/last"],
    refetchInterval: isRunning ? 2000 : false,
  });

  const result = liveResult || data?.result || null;
  const running = isRunning || (data?.running ?? false);

  useEffect(() => {
    if (!isRunning) return;
    const checkInterval = setInterval(() => {
      const timeSinceLastEvent = Date.now() - lastEventTimeRef.current;
      if (timeSinceLastEvent > 60000) {
        setConnectionLost(true);
        setIsRunning(false);
        toast({
          title: "Connection lost",
          description: "The test run connection was interrupted. The tests may still be running on the server — try refreshing or running again.",
          variant: "destructive",
        });
        clearInterval(checkInterval);
      }
    }, 5000);
    return () => clearInterval(checkInterval);
  }, [isRunning]);

  const toggleFile = useCallback((file: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(file)) next.delete(file);
      else next.add(file);
      return next;
    });
  }, []);

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setLiveResult(null);
    liveResultRef.current = null;
    setLiveFiles([]);
    setProgressLines([]);
    setExpandedFiles(new Set());
    setRunError(null);
    setConnectionLost(false);
    lastEventTimeRef.current = Date.now();

    try {
      const response = await fetch("/api/tests/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "Unknown error");
        let errMsg = `Server returned ${response.status}`;
        try {
          const errJson = JSON.parse(errText);
          if (errJson.error) errMsg = errJson.error;
        } catch {
          if (errText) errMsg = errText;
        }
        setRunError(errMsg);
        toast({ title: "Test run failed", description: errMsg, variant: "destructive" });
        setIsRunning(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setRunError("Could not read response stream");
        toast({ title: "Test run failed", description: "Could not read response stream", variant: "destructive" });
        setIsRunning(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      const processChunks = (raw: string): string => {
        const parts = raw.split("\n\n");
        const remainder = parts.pop() || "";
        for (const part of parts) {
          if (!part.trim()) continue;
          const eventMatch = part.match(/^event:\s*(.+)/m);
          const dataMatch = part.match(/^data:\s*([\s\S]+)/m);
          if (!eventMatch || !dataMatch) continue;

          const eventType = eventMatch[1].trim();
          const rawData = dataMatch[1].trim();

          lastEventTimeRef.current = Date.now();

          try {
            const payload = JSON.parse(rawData);

            if (eventType === "file-complete") {
              const fp: LiveFileProgress = {
                file: payload.file,
                status: payload.status,
                testCount: payload.testCount || 0,
                duration: payload.duration || "",
                index: payload.index || 0,
              };
              setLiveFiles((prev) => [...prev, fp]);
            } else if (eventType === "progress" && payload.text) {
              const text = payload.text.trim();
              if (text && !text.startsWith("stdout |")) {
                setProgressLines((prev) => {
                  const lines = text.split("\n").filter((l: string) => l.trim());
                  return [...prev, ...lines].slice(-50);
                });
              }
            } else if (eventType === "done") {
              const res = payload as TestResult;
              setLiveResult(res);
              liveResultRef.current = res;
              if (res.testFiles) {
                const failedFiles = res.testFiles
                  .filter((f: TestFile) => f.status === "fail")
                  .map((f: TestFile) => f.file);
                setExpandedFiles(new Set(failedFiles));
              }
            } else if (eventType === "error") {
              setRunError(payload.error || "Unknown error during test run");
              toast({ title: "Test run error", description: payload.error || "Unknown error", variant: "destructive" });
            }
          } catch (parseErr) {
            console.warn("SSE parse error:", parseErr, "raw:", rawData.substring(0, 200));
          }
        }
        return remainder;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        buffer = processChunks(buffer);
      }
      if (buffer.trim()) {
        processChunks(buffer + "\n\n");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setRunError(msg);
      toast({ title: "Test run failed", description: msg, variant: "destructive" });
    } finally {
      setIsRunning(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tests/last"] });
      if (!liveResultRef.current) {
        try {
          const lastRes = await fetch("/api/tests/last");
          if (lastRes.ok) {
            const lastData = await lastRes.json() as LastTestResponse;
            if (lastData.result) {
              setLiveResult(lastData.result);
              liveResultRef.current = lastData.result;
              const failedFiles = lastData.result.testFiles
                .filter((f: TestFile) => f.status === "fail")
                .map((f: TestFile) => f.file);
              if (failedFiles.length > 0) setExpandedFiles(new Set(failedFiles));
            }
          }
        } catch {
          console.warn("Failed to fetch last test results after run");
        }
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto" data-testid="tests-page-loading">
        <div className="flex items-center gap-2 mb-6">
          <FlaskConical className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Test Suite</h2>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const grouped = result?.testFiles ? groupByDirectory(result.testFiles) : {};
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  const livePassedCount = liveFiles.filter((f) => f.status === "pass").length;
  const liveFailedCount = liveFiles.filter((f) => f.status === "fail").length;

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto" data-testid="tests-page">
      <div className="flex items-center gap-3 flex-wrap">
        <FlaskConical className="w-5 h-5" />
        <h2 className="text-lg font-semibold" data-testid="text-tests-header">Test Suite</h2>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {running && <ElapsedTimer running={running} />}
          {!running && result?.timestamp && (
            <span className="text-xs text-muted-foreground" data-testid="text-last-run-time">
              Last run: {new Date(result.timestamp).toLocaleString()}
            </span>
          )}
          <Button
            onClick={runTests}
            disabled={running}
            data-testid="button-run-tests"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                {result ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {result ? "Re-run Tests" : "Run Tests"}
              </>
            )}
          </Button>
        </div>
      </div>

      {running && !liveResult && (
        <div className="space-y-4" data-testid="section-running">
          <div className="flex items-center gap-3 flex-wrap">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Running test suite...
            </span>
            {liveFiles.length > 0 && (
              <span className="text-xs text-muted-foreground" data-testid="text-live-file-count">
                {liveFiles.length} file{liveFiles.length !== 1 ? "s" : ""} completed
              </span>
            )}
            {livePassedCount > 0 && (
              <span className="text-xs text-green-600 dark:text-green-400" data-testid="text-live-passed">
                {livePassedCount} passed
              </span>
            )}
            {liveFailedCount > 0 && (
              <span className="text-xs text-red-600 dark:text-red-400" data-testid="text-live-failed">
                {liveFailedCount} failed
              </span>
            )}
          </div>

          {liveFiles.length > 0 && (
            <Card data-testid="card-live-progress">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm">Live Progress</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {livePassedCount} passed, {liveFailedCount} failed
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[400px]">
                  <div className="divide-y" data-testid="live-file-list">
                    {liveFiles.map((lf, idx) => {
                      const fileName = lf.file.split("/").pop() || lf.file;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 px-4 py-2"
                          data-testid={`live-file-${idx}`}
                        >
                          <StatusIcon status={lf.status} />
                          <FileCode2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-sm truncate" data-testid={`live-filename-${idx}`}>
                            {fileName}
                          </span>
                          <div className="ml-auto flex items-center gap-2 shrink-0 flex-wrap">
                            {lf.testCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {lf.testCount} test{lf.testCount !== 1 ? "s" : ""}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {lf.duration}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {liveFiles.length === 0 && (
            <Card data-testid="card-running">
              <CardContent className="py-8">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Waiting for test results...</p>
                  <p className="text-xs text-muted-foreground">Individual file results will appear here as they complete.</p>
                  {progressLines.length > 0 && (
                    <ScrollArea className="w-full max-h-48">
                      <pre className="text-xs text-muted-foreground bg-muted p-3 rounded-md whitespace-pre-wrap font-mono" data-testid="pre-progress">
                        {progressLines.slice(-20).join("\n")}
                      </pre>
                    </ScrollArea>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {connectionLost && !running && (
        <Card data-testid="card-connection-lost">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-3">
              <WifiOff className="w-8 h-8 text-yellow-500" />
              <p className="text-sm font-medium">Connection interrupted</p>
              <p className="text-xs text-muted-foreground max-w-md text-center">
                The connection to the test run was lost. The tests may have finished on the server.
                Try running again or refresh the page.
              </p>
              <Button onClick={runTests} variant="outline" className="mt-2" data-testid="button-retry-lost">
                <RotateCcw className="w-4 h-4" />
                Run Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {runError && !running && !result && !connectionLost && (
        <Card data-testid="card-run-error">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <p className="text-sm font-medium">Test run failed</p>
              <p className="text-xs text-muted-foreground max-w-md text-center">{runError}</p>
              <Button onClick={runTests} variant="outline" className="mt-2" data-testid="button-retry">
                <RotateCcw className="w-4 h-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {result && !running && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" data-testid="summary-cards">
            <Card data-testid="card-total">
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold" data-testid="text-total-count">{result.summary.total}</p>
              </CardContent>
            </Card>
            <Card data-testid="card-passed">
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground mb-1">Passed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-passed-count">
                  {result.summary.passed}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="card-failed">
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-failed-count">
                  {result.summary.failed}
                </p>
              </CardContent>
            </Card>
            <Card data-testid="card-skipped">
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground mb-1">Skipped</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400" data-testid="text-skipped-count">
                  {result.summary.skipped}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-3 flex-wrap" data-testid="run-summary-bar">
            <Badge
              variant={result.status === "pass" ? "success" : result.status === "fail" ? "error" : "warning"}
              data-testid="badge-overall-status"
            >
              {result.status === "pass" ? "All Passed" : result.status === "fail" ? "Some Failed" : "Error"}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid="text-duration">
              <Clock className="w-3 h-3" />
              {formatDuration(result.durationMs)}
            </span>
            <span className="text-xs text-muted-foreground" data-testid="text-file-count">
              {result.testFiles.length} file{result.testFiles.length !== 1 ? "s" : ""}
            </span>
          </div>

          {result.status === "error" && (result.errorOutput || result.rawOutput) && (
            <Card data-testid="card-error-output">
              <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <CardTitle className="text-sm">Error Output</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap text-red-600 dark:text-red-400" data-testid="pre-error-output">
                  {result.errorOutput || result.rawOutput}
                </pre>
              </CardContent>
            </Card>
          )}

          {sortedGroups.length > 0 && (
            <Card data-testid="card-test-files">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm">Test Files</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {result.testFiles.filter((f) => f.status === "pass").length} passed,{" "}
                  {result.testFiles.filter((f) => f.status === "fail").length} failed
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[600px]">
                  <div className="divide-y" data-testid="test-file-list">
                    {sortedGroups.map(([dir, files]) => (
                      <div key={dir}>
                        <div className="px-4 py-2 bg-muted/50">
                          <span className="text-xs font-medium text-muted-foreground" data-testid={`text-dir-${dir}`}>
                            {dir}/
                          </span>
                        </div>
                        {files.map((tf) => {
                          const isExpanded = expandedFiles.has(tf.file);
                          const fileName = tf.file.split("/").pop() || tf.file;
                          const passCount = tf.tests.filter((t) => t.status === "pass").length;
                          const failCount = tf.tests.filter((t) => t.status === "fail").length;
                          const skipCount = tf.tests.filter((t) => t.status === "skip").length;

                          return (
                            <div key={tf.file} data-testid={`test-file-${tf.file}`}>
                              <button
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover-elevate"
                                onClick={() => toggleFile(tf.file)}
                                data-testid={`button-toggle-file-${tf.file}`}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                )}
                                <StatusIcon status={tf.status} />
                                <FileCode2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                <span className="text-sm font-medium truncate" data-testid={`text-filename-${tf.file}`}>
                                  {fileName}
                                </span>
                                <div className="ml-auto flex items-center gap-2 shrink-0 flex-wrap">
                                  {passCount > 0 && (
                                    <span className="text-xs text-green-600 dark:text-green-400" data-testid={`text-pass-count-${tf.file}`}>
                                      {passCount} passed
                                    </span>
                                  )}
                                  {failCount > 0 && (
                                    <span className="text-xs text-red-600 dark:text-red-400" data-testid={`text-fail-count-${tf.file}`}>
                                      {failCount} failed
                                    </span>
                                  )}
                                  {skipCount > 0 && (
                                    <span className="text-xs text-yellow-600 dark:text-yellow-400" data-testid={`text-skip-count-${tf.file}`}>
                                      {skipCount} skipped
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground" data-testid={`text-file-duration-${tf.file}`}>
                                    {formatDuration(tf.durationMs)}
                                  </span>
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="pl-14 pr-4 pb-3 space-y-1" data-testid={`test-cases-${tf.file}`}>
                                  {tf.tests.map((tc, idx) => (
                                    <div key={idx} data-testid={`test-case-${tf.file}-${idx}`}>
                                      <div className="flex items-center gap-2 py-1.5">
                                        <StatusIcon status={tc.status} />
                                        <span
                                          className={`text-xs ${
                                            tc.status === "pass"
                                              ? "text-green-700 dark:text-green-300"
                                              : tc.status === "fail"
                                              ? "text-red-700 dark:text-red-300"
                                              : "text-yellow-700 dark:text-yellow-300"
                                          }`}
                                          data-testid={`text-test-name-${tf.file}-${idx}`}
                                        >
                                          {tc.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-auto shrink-0">
                                          {formatDuration(tc.durationMs)}
                                        </span>
                                      </div>
                                      {tc.error && (
                                        <pre
                                          className="text-xs bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 p-2 rounded-md mt-1 mb-2 overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap"
                                          data-testid={`pre-error-${tf.file}-${idx}`}
                                        >
                                          {tc.error}
                                        </pre>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {result.testFiles.length === 0 && result.status !== "error" && (
            <Card data-testid="card-no-tests">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <FlaskConical className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-base font-medium mb-1">No test results</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  The test run completed but no test files were found.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!result && !running && !runError && !connectionLost && (
        <Card data-testid="card-empty-state">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FlaskConical className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-base font-medium mb-1">No test runs yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Run the Vitest test suite to see results here with color-coded pass/fail status.
            </p>
            <Button onClick={runTests} data-testid="button-run-tests-empty">
              <Play className="w-4 h-4" />
              Run Tests
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
