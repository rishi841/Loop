"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";

export default function FeedbackImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setSuccess("");

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setError("Please select a CSV file.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await fetch(
        "/api/feedback/import",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.message || "CSV import failed."
        );
        return;
      }

      setSuccess(
        `${result.importedCount} feedback ${
          result.importedCount === 1
            ? "entry"
            : "entries"
        } imported successfully.`
      );

      setFile(null);

      event.currentTarget.reset();
    } catch (error) {
      console.error(
        "CSV import request failed:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-white">
              LOOP
            </p>

            <p className="text-[10px] text-slate-500">
              Customer Feedback Intelligence
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/feedback/inbox"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Feedback Inbox
            </Link>

            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Dashboard
            </Link>
          </div>
        </header>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              Import feedback
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Upload a CSV file to add multiple customer
              feedback entries at once.
            </p>
          </div>

          {/* CSV format */}
          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-5">
            <h2 className="text-sm font-semibold text-white">
              CSV format
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Your CSV should contain these columns:
            </p>

            <code className="mt-3 block overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-300">
              content,customerName,customerEmail
            </code>

            <p className="mt-3 text-xs text-slate-500">
              The content column is required.
              Customer name and email are optional.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* File input */}
            <div>
              <label
                htmlFor="csvFile"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                CSV file
              </label>

              <input
                id="csvFile"
                name="csvFile"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="block w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-300 file:mr-4 file:border-0 file:bg-white file:px-4 file:py-3 file:font-semibold file:text-slate-950 hover:file:bg-slate-200"
              />

              {file && (
                <p className="mt-3 text-sm text-slate-400">
                  Selected:{" "}
                  <span className="text-slate-200">
                    {file.name}
                  </span>
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-900 bg-red-950/50 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-lg border border-green-900 bg-green-950/50 p-4 text-sm text-green-300">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Importing..."
                : "Import CSV"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}