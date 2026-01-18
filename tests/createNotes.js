export async function createNote(page, title, content) {
  await page.getByTestId("addNoteInSection").click();
  await page.getByTestId("title").fill(title);
  await page.getByTestId("content").fill(content);
  await page.getByText("Save Note").click();
}

export async function createNotesInNotebook(page, notebookId, notes) {
  await page.getByTestId("notebookDropdown").selectOption(notebookId);
  for (const note of notes) {
    await createNote(page, note.title, note.content);
  }
}