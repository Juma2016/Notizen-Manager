// @ts-check
import { test, expect } from "@playwright/test";

test("Notizt Bücher werden geladen", async ({ request }) => {
  const response = await request.get("/api/notebooks");
  expect(response.ok).toBeTruthy();
  console.log(response);
  expect(await response.json()).toEqual([
    { id: "nb1", title: "Work Notes" },
    { id: "nb2", title: "Personal Projects" },
    { id: "nb3", title: "Shopping Lists" },
    { id: "nb4", title: "University" },
  ]);
});
