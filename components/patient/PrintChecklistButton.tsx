"use client";

export function PrintChecklistButton() {
  return <button type="button" className="patient-button patient-button-teal" onClick={() => window.print()}>Print document checklist</button>;
}
