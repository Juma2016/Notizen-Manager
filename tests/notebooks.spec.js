import { test, expect } from "@playwright/test";
import {
  personalProjects,
  shoppingLists,
  universityNotes,
  workNotes,
} from "./filterobjects";
import { createNote, createNotesInNotebook } from "./createNotes";

const frontendUrl = "http://127.0.0.1:5500/index.html"; // Change URL to your frontend URL

test("Richtige Seite Laden", async ({ page }) => {
  await page.goto(frontendUrl);

  await expect(page).toHaveTitle(/Notes Manager/);
});

test("Notizt Bücher werden geladen", async ({ request }) => {
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

test("Bearbeiten → updatedAt ändert sich.", async ({ page }) => {
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
    "Client Presentation",
    "Group Project",
  ]);

  await page.locator("#search").clear();

  await expect(page.getByTestId("note-title")).toHaveCount(3);
  await expect(page.getByTestId("note-title")).toHaveText([
    "Exam Preparation",
    "Thesis Deadline",
    "Group Project",
  ]);
});
