import { test, expect } from "@playwright/test";
import {
  personalProjects,
  shoppingLists,
  universityNotes,
  workNotes,
} from "./filterobjects";
import { lifeNotes } from "./tagObjects";
import { createNote, createNotesInNotebook } from "./createNotes";

const frontendUrl = "http://127.0.0.1:5500/index.html"; // Change URL to your frontend URL

test("Richtige Seite Laden", async ({ page }) => {
  await page.goto(frontendUrl);

  await expect(page).toHaveTitle(/Notes Manager/);
});

test("Notiz Bücher werden geladen", async ({ request }) => {
  const response = await request.get("/api/notebooks");
  expect(response.ok).toBeTruthy();
  expect(await response.json()).toEqual([
    { id: "nb1", title: "Work Notes" },
    { id: "nb2", title: "Personal Projects" },
    { id: "nb3", title: "Shopping Lists" },
    { id: "nb4", title: "University" },
  ]);
});

test("Neue Notiz anlegen → erscheint in Liste → Reload → noch da.", async ({
  page,
}) => {
  await page.goto(frontendUrl);

  await page.getByTestId("notebookDropdown").selectOption("nb1");
  await createNote(page, "New Title", "New Content Created");

  expect(await page.getByTestId("note-title").textContent()).toEqual(
    "New Title",
  );

  expect(await page.getByTestId("note-content").textContent()).toEqual(
    "New Content Created",
  );

  await page.reload();

  await page.getByTestId("notebookDropdown").selectOption("nb1");

  expect(await page.getByTestId("note-title").textContent()).toEqual(
    "New Title",
  );

  expect(await page.getByTestId("note-content").textContent()).toEqual(
    "New Content Created",
  );
});

test("Bearbeiten → Inhalt aktualisiert sich.", async ({ page }) => {
  await page.goto(frontendUrl);

  await page.getByTestId("notebookDropdown").selectOption("nb1");
  await createNote(page, "New Title", "New Content Created");

  expect(await page.getByTestId("note-title").textContent()).toEqual(
    "New Title",
  );

  expect(await page.getByTestId("note-content").textContent()).toEqual(
    "New Content Created",
  );

  await page.getByRole("button").getByText("Edit").click();

  await page.getByTestId("title").fill("Edited Title");
  await page.getByTestId("content").fill("Edited Content Created");

  await page.getByText("Save Note").click();

  expect(await page.getByTestId("note-title").textContent()).toEqual(
    "Edited Title",
  );

  expect(await page.getByTestId("note-content").textContent()).toEqual(
    "Edited Content Created",
  );

  await page.reload();

  await page.getByTestId("notebookDropdown").selectOption("nb1");

  expect(await page.getByTestId("note-title").textContent()).toEqual(
    "Edited Title",
  );

  expect(await page.getByTestId("note-content").textContent()).toEqual(
    "Edited Content Created",
  );
});

test("Editieren einer Notiz aktualisiert den Zeitstempel", async ({ page }) => {
  await page.goto(frontendUrl);

  await page.getByTestId("notebookDropdown").selectOption("nb1");
  await createNote(page, "Zeit-Test", "Inhalt vor dem Edit");

  const oldDateText = await page.locator(".note-date").first().textContent();

  await page.waitForTimeout(1500);

  await page.getByRole("button", { name: "Edit" }).first().click();
  await page.getByTestId("title").fill("Zeit-Test Editierter Titel");
  await page.getByText("Save Note").click();

  const newDateText = await page.locator(".note-date").first().textContent();

  expect(newDateText).toBeTruthy();
  expect(newDateText).not.toBe(oldDateText);
});

test("Suche filtert korrekt", async ({ page }) => {
  await page.goto(frontendUrl);

  await createNotesInNotebook(page, "nb1", workNotes);
  await createNotesInNotebook(page, "nb2", personalProjects);
  await createNotesInNotebook(page, "nb3", shoppingLists);
  await createNotesInNotebook(page, "nb4", universityNotes);

  await page.locator("#search").fill("Exam");

  await expect(page.getByTestId("note-title")).toHaveCount(1);
  await expect(page.getByTestId("note-title")).toHaveText("Exam Preparation");

  await page.locator("#search").fill("slides");

  await expect(page.getByTestId("note-title")).toHaveCount(2);
  await expect(page.getByTestId("note-title")).toHaveText([
    "Group Project",
    "Client Presentation",
  ]);

  await page.locator("#search").clear();

  await expect(page.getByTestId("note-title")).toHaveCount(3);
  await expect(page.getByTestId("note-title")).toHaveText([
    "Group Project",
    "Thesis Deadline",
    "Exam Preparation",
  ]);
});

test("Alphabetische Sortierung nach Titel funktioniert korrekt", async ({
  page,
}) => {
  await page.goto(frontendUrl);

  await createNotesInNotebook(page, "nb3", shoppingLists);

  await page.getByTestId("sort-select").selectOption("title-asc");
  const noteTitlesAsc = page.getByTestId("note-title");

  await expect(noteTitlesAsc).toHaveText([
    "Electronics Store",
    "Pharmacy",
    "Weekend Groceries",
  ]);

  await page.getByTestId("sort-select").selectOption("title-desc");
  const noteTitlesDesc = page.getByTestId("note-title");

  await expect(noteTitlesDesc).toHaveText(
    ["Electronics Store", "Pharmacy", "Weekend Groceries"].reverse(),
  );
});

test("Filtern nach mehreren Tags funktioniert korrekt", async ({ page }) => {
  await page.goto(frontendUrl);

  await createNotesInNotebook(page, "nb2", lifeNotes);

  await page.getByTestId("tagFilter").selectOption("fitness");

  let noteContent = page.getByTestId("note-content");

  await expect(noteContent).toHaveText([
    "Cook chicken and rice for the next 3 days.",
    "Monday: Chest and Triceps. Wednesday: Back and Biceps.",
  ]);

  await page.getByTestId("tagFilter").selectOption("reading");

  noteContent = page.getByTestId("note-content");

  await expect(noteContent).toHaveText(
    "Read chapters 1-5 of The Great Gatsby.",
  );
});
