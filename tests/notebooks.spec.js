// @ts-check
import { test, expect } from "@playwright/test";

const frontendUrl = "http://127.0.0.1:5500/index.html"; // url eventuell ändern

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

  await page.getByTestId("addNoteInSection").click();

  await page.getByTestId("title").fill("New Title");
  await page.getByTestId("content").fill("New Content Created");

  await page.getByText("Save Note").click();

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
