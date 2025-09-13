import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="container py-8 md:py-12">
      {/* Header */}
      <section className="mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
          Weekendly Documentation
        </h1>
        <p className="text-muted-foreground">
          Features, shortcuts, tips, and developer notes
        </p>
      </section>

      {/* Quick Nav */}
      <nav className="mb-8 md:mb-12 rounded-xl bg-card border p-4 md:p-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            ['What is it?', '#what-is'],
            ['How to use', '#how-to-use'],
            ['Benefits', '#benefits'],
            ['Usage / Use cases', '#usage'],
            ['Walkthrough', '#walkthrough'],
            ['Getting Started', '#getting-started'],
            ['Manual Add', '#manual-add'],
            ['Shortcuts', '#shortcuts'],
            ['Planner Features', '#planner-features'],
            ['Export & Share', '#export-share'],
            ['Tips', '#tips'],
            ['Developer Guide', '#developer']
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      {/* What is it */}
      <section id="what-is" className="mb-8 md:mb-12 rounded-2xl border bg-card shadow-sm p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-bold mb-4">What is Weekendly?</h2>
        <p className="text-muted-foreground">
          Weekendly is a two-pane planner to design delightful Saturdays and Sundays fast. Browse smart activity ideas on the left, then drag-and-drop to a time-grid schedule on the right. Save, share, and export to your calendar.
        </p>
      </section>

      {/* How to use */}
      <section id="how-to-use" className="mb-8 md:mb-12 rounded-2xl border bg-card shadow-sm p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-bold mb-4">How to use</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Select a theme (Lazy, Adventurous, Family) in the header to tailor suggestions.</li>
          <li>Search or filter in the Activity Browser to find ideas.</li>
          <li>Drag an activity into the weekend grid; it snaps to 15-min slots.</li>
          <li>Edit duration, notes, or mood inside the schedule when needed.</li>
          <li>Use keyboard shortcuts to save, export, share, undo/redo quickly.</li>
        </ul>
      </section>

      {/* Benefits */}
      <section id="benefits" className="mb-8 md:mb-12 rounded-2xl border bg-card shadow-sm p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-bold mb-4">Benefits</h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-muted-foreground">
          <li>Faster planning with curated ideas and drag-and-drop.</li>
          <li>Balanced weekends via moods (Chill, Social, Energetic, Focus).</li>
          <li>Reliable syncing with .ics calendar export.</li>
          <li>Theme-based autosave and quick share links.</li>
        </ul>
      </section>

      {/* Usage / Use cases */}
      <section id="usage" className="mb-8 md:mb-12 rounded-2xl border bg-card shadow-sm p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-bold mb-4">Usage / Use cases</h2>
        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
          <li>Solo recharge weekends with focus blocks and cozy breaks.</li>
          <li>Family days packed with age-friendly activities.</li>
          <li>Adventure sprints with back-to-back outdoor plans.</li>
          <li>Content planning for creators: shoot, edit, publish across two days.</li>
        </ul>
      </section>

      {/* Walkthrough (6–7 steps) */}
      <section id="walkthrough" className="mb-8 md:mb-12 rounded-2xl border bg-card shadow-sm p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-bold mb-4">Quick Walkthrough (7 steps)</h2>
        <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
          <li>Pick a theme in the header to load matching suggestions.</li>
          <li>Search or browse categories in the Activity Browser.</li>
          <li>Drag an activity onto Saturday; it auto-picks the next open time.</li>
          <li>Click an item to adjust duration, notes, or mood labels.</li>
          <li>Use "Add manually" if you need a custom activity.</li>
          <li>Save (Cmd/Ctrl+S). Export JSON or Calendar when ready.</li>
          <li>Share your plan: copy the link; opening it imports automatically.</li>
        </ol>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="mb-8 md:mb-12 rounded-2xl border bg-card shadow-sm p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-bold mb-4">Getting Started</h2>
        <p className="text-muted-foreground">
          Weekendly is split into two panels. On the left, your Activity Browser provides categorized suggestions based on a theme (Lazy, Adventurous, or Family). Choose activities and drag individual items to schedule them on the right-hand Weekend Planner.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Lazy:</b> Chill suggestions and quick, relaxing activities.</li>
          <li><b>Adventurous:</b> Energy-bursting ideas to fill the weekend.</li>
          <li><b>Family:</b> Parent- and child-friendly picks.</li>
        </ul>
      </section>

      {/* Manual Add */}
      <section id="manual-add" className="mb-8 md:mb-12 rounded-2xl border bg-card shadow-sm p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-bold mb-4">Manual Add</h2>
        <p className="text-muted-foreground">
          Not finding the perfect activity? Tap the "Add manually" button beside Reset. You can set title, description, category, 15-minute duration steps, difficulty, and one or more moods (Chill, Social, Energetic, Focus). New items auto-place at the next available slot on Saturday.
        </p>
      </section>

      {/* Shortcuts */}
      <section id="shortcuts" className="mb-8 md:mb-12 rounded-2xl border bg-card shadow-sm p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-bold mb-4">Shortcuts</h2>
        <ul className="space-y-2">
          <li><b>Cmd/Ctrl+S</b> — Save plan</li>
          <li><b>Cmd/Ctrl+E</b> — Export JSON</li>
          <li><b>Cmd/Ctrl+Shift+E</b> — Export calendar (.ics)</li>
          <li><b>Cmd/Ctrl+I</b> — Import plan</li>
          <li><b>Cmd/Ctrl+L</b> — Copy share link</li>
          <li><b>Cmd/Ctrl+Z</b> — Undo</li>
          <li><b>Cmd/Ctrl+Shift+Z</b> or <b>Cmd/Ctrl+Y</b> — Redo</li>
          <li><b>?</b> or <b>Cmd/Ctrl+/</b> — Open Help</li>
        </ul>
      </section>

      {/* Planner Features */}
      <section id="planner-features" className="mb-8 md:mb-12 rounded-2xl border bg-card shadow-sm p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-bold mb-4">Planner Features</h2>
        <ul className="space-y-2">
          <li>Autosave of the current theme to <code className="rounded bg-muted text-card-foreground px-1">localStorage</code></li>
          <li>Robundo/redo history</li>
          <li>Import/export plans as JSON</li>
          <li>Export upcoming weekend as an .ics file with UTC timestamps</li>
          <li>Per-activity labels: <span className="inline-block w-2 h-2 rounded-full bg-teal-500 mr-1"></span>Chill
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mx-1 ml-3"></span>Social
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mx-1"></span>Energetic
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mx-1"></span>Focus</li>
          <li>Details saved as the activity description (notes)</li>
        </ul>
      </section>

      {/* Export & Share */}
      <section id="export-share" className="mb-8 md:mb-12 rounded-2xl border bg-card shadow-sm p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-bold mb-4">Export & Share</h2>
        <p className="text-muted-foreground">
          The share link contains a URL hash (#plan=...) packed with your plan data; visiting that link automatically imports it. Export JSON bundles the current state for storage or sharing. .ics exports appear as <code className="rounded bg-muted text-card-foreground px-1">weekendly.ics</code> on download.
        </p>
      </section>

      {/* Tips */}
      <section id="tips" className="mb-8 md:mb-12 rounded-2xl border bg-card shadow-sm p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-bold mb-4">Tips</h2>
        <ul className="list-disc pl-5">
          <li>You can drag from the search row too—no need to open the group first.</li>
          <li>Filter by category or by searching moods. Reset clears filters AND reverts to defaults.</li>
          <li>Activity blocks will auto-snap to 15-min increments when placed.</li>
        </ul>
      </section>

      {/* Developer Guide */}
      <section id="developer" className="mb-8 md:mb-12 rounded-2xl border bg-card shadow-sm p-6 md:p-8 space-y-3">
        <h2 className="text-xl font-bold mb-4">Developer Guide</h2>
        <ul className="list-disc pl-5">
          <li>Stack: Next.js 1<wbr />5 (App Router), TypeScript, Shadcn UI, Tailwind <abbr title="Version 4">v4</abbr>.</li>
          <li>Core components: <code className="rounded bg-muted text-card-foreground px-1">WeekendHeader</code>, <code className="rounded bg-muted text-card-foreground px-1">ActivityBrowser</code>, <code className="p-0.5 bg-muted rounded text-card-foreground px-1">WeekendSchedule</code>.</li>
          <li>Global shortcuts live in <code className="rounded bg-muted text-card-foreground px-1">src/app/page.tsx</code>.</li>
          <li>Storage keys: <code className="rounded bg-muted px-1">"weekendly.theme"</code> and <code className="rounded bg-muted text-card-foreground px-1">"weekendly.plan.&lt;theme&gt;"</code>.</li>
          <li>Extensible: add new categories or moods in <code className="rounded bg-muted text-card-foreground px-1">ActivityBrowser defaultActivities</code> and adapt the mapping in <code className="rounded bg-muted text-card-foreground px-1">page.tsx addFromBrowser</code>.</li>
        </ul>
      </section>

      {/* Footer note */}
      <p className="text-center text-muted-foreground text-sm mt-12">
        Back to{' '}
        <Link href="/" className="text-primary hover:underline">
          Weekendly Plans
        </Link>
      </p>
    </div>
  );
}