import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
const imported = [
  {
    id: 5,
    formName: "Contact",
    fields: [
      {
        id: 7,
        fieldType: "email",
        fieldName: "Email",
        value: "",
        required: false,
      },
      {
        id: 8,
        fieldType: "date",
        fieldName: "Date",
        value: "",
        required: true,
      },
      {
        id: 9,
        fieldType: "select",
        fieldName: "Ville",
        value: "",
        required: true,
        options: [
          { id: 1, value: "Paris" },
          { id: 2, value: "Évry" },
        ],
      },
      {
        id: 10,
        fieldType: "radio",
        fieldName: "Choix",
        value: "",
        required: true,
        options: [
          { id: 3, value: "Oui" },
          { id: 4, value: "Non" },
        ],
      },
      {
        id: 11,
        fieldType: "range",
        fieldName: "Note",
        value: 0,
        required: true,
        min: -10,
        max: 10,
      },
      {
        id: 12,
        fieldType: "file",
        fieldName: "Pièce jointe",
        value: "",
        required: false,
      },
    ],
  },
];
test("création, réorganisation au clavier, réponses isolées et persistance", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByLabel("Libellé", { exact: true }).fill("Prénom");
  await page.getByText("Réponse obligatoire", { exact: true }).click();
  await page
    .getByRole("button", { name: "Ajouter au formulaire", exact: true })
    .click();
  await page.getByLabel("Type de champ").selectOption("number");
  await page.getByLabel("Libellé", { exact: true }).fill("Âge");
  await page
    .getByRole("button", { name: "Ajouter au formulaire", exact: true })
    .click();
  await page.getByLabel("Type de champ").selectOption("checkbox");
  await page.getByLabel("Libellé", { exact: true }).fill("Activités");
  await page.getByLabel("Options, une par ligne").fill("Sport\nMusique");
  await page
    .getByRole("button", { name: "Ajouter au formulaire", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Monter Activités", exact: true })
    .click();
  await page.getByLabel("Déplacer Prénom", { exact: true }).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await page
    .getByLabel("Nom du formulaire", { exact: true })
    .fill("Inscription");
  await page
    .getByRole("button", { name: "Enregistrer le formulaire", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("allForms") || "[]")[0]
          ?.fields.map((f: { fieldName: string }) => f.fieldName)
          .join(","),
      ),
    )
    .toBe("Activités,Prénom,Âge");
  await page
    .getByRole("button", { name: "Nouvelle réponse", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enregistrer la réponse", exact: true })
    .click();
  await expect(
    page.getByText("Ce champ est obligatoire.", { exact: true }).first(),
  ).toBeVisible();
  await page.getByLabel("Prénom", { exact: false }).fill("Alice");
  await page.getByText("Sport", { exact: true }).click();
  await page.getByLabel("Âge", { exact: false }).fill("0");
  await page
    .getByRole("button", { name: "Enregistrer la réponse", exact: true })
    .click();
  await expect(page.getByText("Alice", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Formulaires (1)" }).click();
  await page
    .getByRole("button", { name: "Nouvelle réponse", exact: true })
    .click();
  await expect(page.getByLabel("Prénom", { exact: false })).toHaveValue("");
  await page.getByLabel("Prénom", { exact: false }).fill("Bob");
  await page.getByText("Musique", { exact: true }).click();
  await page.getByLabel("Âge", { exact: false }).fill("101");
  await page
    .getByRole("button", { name: "Enregistrer la réponse", exact: true })
    .click();
  await expect(
    page.getByText("La valeur maximale est 100.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Âge", { exact: false }).fill("25");
  await page
    .getByRole("button", { name: "Enregistrer la réponse", exact: true })
    .click();
  await expect(page.getByText("Alice", { exact: true })).toBeVisible();
  await expect(page.getByText("Bob", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Réponses (2)" }).click();
  await expect(page.getByText("Alice", { exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Supprimer la réponse 2", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Réponses (1)" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("les six autres types, édition, recherche, imports et exports fonctionnent", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Formulaires (0)" }).click();
  await page.getByLabel("Importer des formulaires JSON").setInputFiles({
    name: "form.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(imported)),
  });
  await expect(
    page.getByRole("heading", { name: "Contact", exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exporter", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("formulaires.json");
  await page.getByLabel("Rechercher un formulaire").fill("introuvable");
  await expect(
    page.getByText("Aucun formulaire ne correspond à cette recherche."),
  ).toBeVisible();
  await page.getByLabel("Rechercher un formulaire").fill("");
  await page.getByRole("button", { name: "Modifier", exact: true }).click();
  await page
    .getByLabel("Nom du formulaire", { exact: true })
    .fill("Contact modifié");
  await page
    .getByRole("button", { name: "Enregistrer le formulaire", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Formulaires (1)" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Nouvelle réponse", exact: true })
    .click();
  await page.getByLabel("Email", { exact: true }).fill("invalide");
  await page
    .getByRole("button", { name: "Enregistrer la réponse", exact: true })
    .click();
  await expect(
    page.getByText("Saisissez une adresse email valide.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill("");
  await page.getByLabel("Date", { exact: false }).fill("2026-10-08");
  await page.getByLabel("Ville", { exact: false }).selectOption("Évry");
  await page.getByLabel("Oui", { exact: true }).check();
  await page.getByLabel("Note", { exact: false }).fill("5");
  await page.getByLabel("Pièce jointe", { exact: true }).setInputFiles({
    name: "exemple.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("contenu"),
  });
  await page
    .getByRole("button", { name: "Enregistrer la réponse", exact: true })
    .click();
  await expect(page.getByText("exemple.txt", { exact: true })).toBeVisible();
  await expect(page.getByText("Évry", { exact: true })).toBeVisible();
  const answerDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exporter les réponses" }).click();
  expect((await answerDownload).suggestedFilename()).toBe("reponses.json");
  await page.getByRole("button", { name: "Formulaires (1)" }).click();
  await page.getByLabel("Importer des formulaires JSON").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('[{"id":1}]'),
  });
  await expect(page.getByRole("status")).toContainText(
    "format des données est invalide",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Supprimer le formulaire Contact modifié" })
    .click();
  await expect(
    page.getByRole("button", { name: "Formulaires (0)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Réponses (1)" }),
  ).toBeVisible();
});
test("stockage corrompu ou indisponible : aucune écriture destructive", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("allForms", "{"));
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("illisibles");
  await expect(
    page.getByRole("button", { name: "Enregistrer le formulaire" }),
  ).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem("allForms"))).toBe("{");
});
for (const width of [1440, 390, 320]) {
  test(`navigation et formulaires sans débordement à ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page
      .getByLabel("Libellé", { exact: true })
      .fill("Un libellé suffisamment long pour vérifier le retour à la ligne");
    await page
      .getByRole("button", { name: "Ajouter au formulaire", exact: true })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Tester le formulaire" }).click();
    await page
      .getByLabel(
        "Un libellé suffisamment long pour vérifier le retour à la ligne",
      )
      .fill("Mobile");
    await page
      .getByRole("button", { name: "Enregistrer la réponse", exact: true })
      .click();
    await expect(page.getByText("Mobile", { exact: true })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
test("échec d’écriture : le brouillon reste visible et aucun faux enregistrement", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Libellé", { exact: true }).fill("À conserver");
  await page
    .getByRole("button", { name: "Ajouter au formulaire", exact: true })
    .click();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", { name: "Enregistrer le formulaire", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "ne peut pas enregistrer",
  );
  await expect(
    page.getByLabel("Nom du formulaire", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Formulaires (0)" }),
  ).toBeVisible();
});
test("bornes négatives et options : refus des configurations invalides", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Type de champ").selectOption("number");
  await page.getByLabel("Libellé", { exact: true }).fill("Température");
  await page.getByLabel("Minimum", { exact: true }).fill("10");
  await page.getByLabel("Maximum", { exact: true }).fill("0");
  await page
    .getByRole("button", { name: "Ajouter au formulaire", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("minimum inférieur");
  await page.getByLabel("Minimum", { exact: true }).fill("-20");
  await page.getByLabel("Maximum", { exact: true }).fill("50");
  await page
    .getByRole("button", { name: "Ajouter au formulaire", exact: true })
    .click();
  await page.getByLabel("Type de champ").selectOption("select");
  await page.getByLabel("Libellé", { exact: true }).fill("Choix");
  await page.getByLabel("Options, une par ligne").fill("Même\nMême");
  await page
    .getByRole("button", { name: "Ajouter au formulaire", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("options différentes");
  await expect(page.getByText("1 champ(s)", { exact: true })).toBeVisible();
});
test("les onglets partagent les listes sans perdre le brouillon ouvert", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByLabel("Libellé", { exact: true }).fill("Brouillon ouvert");
  await page
    .getByRole("button", { name: "Ajouter au formulaire", exact: true })
    .click();
  const other = await context.newPage();
  await other.goto("/");
  await other.getByLabel("Libellé", { exact: true }).fill("Autre onglet");
  await other
    .getByRole("button", { name: "Ajouter au formulaire", exact: true })
    .click();
  await other
    .getByLabel("Nom du formulaire", { exact: true })
    .fill("Autre formulaire");
  await other
    .getByRole("button", { name: "Enregistrer le formulaire", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Formulaires (1)" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Brouillon ouvert", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Enregistrer le formulaire", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Formulaires (2)" }),
  ).toBeVisible();
  await other.reload();
  await other.getByRole("button", { name: "Formulaires (2)" }).click();
  await expect(
    other.getByRole("heading", { name: "Autre formulaire", exact: true }),
  ).toBeVisible();
});
test("deux sauvegardes simultanées entre onglets sont sérialisées sans perte", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const other = await context.newPage();
  await other.goto("/");
  for (const [tab, name] of [
    [page, "Premier"],
    [other, "Second"],
  ] as const) {
    await tab.getByLabel("Libellé", { exact: true }).fill("Nom");
    await tab
      .getByRole("button", { name: "Ajouter au formulaire", exact: true })
      .click();
    await tab.getByLabel("Nom du formulaire", { exact: true }).fill(name);
  }
  const lock = page.evaluate(() =>
    navigator.locks.request("atelier-formulaires-storage", async () => {
      document.documentElement.dataset.testLockHeld = "yes";
      await new Promise<void>((resolve) =>
        document.addEventListener("release-test-lock", () => resolve(), {
          once: true,
        }),
      );
    }),
  );
  await page.waitForFunction(
    () => document.documentElement.dataset.testLockHeld === "yes",
  );
  await Promise.all(
    [page, other].map((tab) =>
      tab
        .getByRole("button", { name: "Enregistrer le formulaire", exact: true })
        .click(),
    ),
  );
  await page.evaluate(() =>
    document.dispatchEvent(new Event("release-test-lock")),
  );
  await lock;
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("allForms") || "[]").length,
      ),
    )
    .toBe(1);
  await expect(
    page.getByRole("button", { name: "Formulaires (1)", exact: true }),
  ).toBeVisible();
  await expect(
    other.getByRole("button", { name: "Formulaires (1)", exact: true }),
  ).toBeVisible();
  const remaining = (await page
    .getByRole("button", { name: "Enregistrer le formulaire", exact: true })
    .count())
    ? page
    : other;
  await remaining
    .getByRole("button", { name: "Enregistrer le formulaire", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("allForms") || "[]")
          .map((form: { formName: string }) => form.formName)
          .sort(),
      ),
    )
    .toEqual(["Premier", "Second"]);
});
test("un brouillon périmé ne remplace pas l’édition d’un autre onglet et reste exportable", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByLabel("Libellé", { exact: true }).fill("Nom");
  await page
    .getByRole("button", { name: "Ajouter au formulaire", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enregistrer le formulaire", exact: true })
    .click();
  await page.getByRole("button", { name: "Modifier", exact: true }).click();
  const other = await context.newPage();
  await other.goto("/");
  await other
    .getByRole("button", { name: "Formulaires (1)", exact: true })
    .click();
  await other.getByRole("button", { name: "Modifier", exact: true }).click();
  await other
    .getByLabel("Nom du formulaire", { exact: true })
    .fill("Version distante");
  await other
    .getByRole("button", { name: "Enregistrer le formulaire", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("autre onglet");
  await page
    .getByLabel("Nom du formulaire", { exact: true })
    .fill("Brouillon conservé");
  await page
    .getByRole("button", { name: "Enregistrer le formulaire", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Votre brouillon est conservé",
  );
  expect(
    await page.evaluate(() => JSON.parse(localStorage.allForms)[0].formName),
  ).toBe("Version distante");
  await expect(
    page.getByLabel("Nom du formulaire", { exact: true }),
  ).toHaveValue("Brouillon conservé");
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exporter le brouillon", exact: true })
    .click();
  const path = await (await pending).path();
  if (!path) throw new Error("Téléchargement absent");
  expect(JSON.parse(await readFile(path, "utf8"))[0].formName).toBe(
    "Brouillon conservé",
  );
});
test("une double soumission enregistre une seule réponse et la nouvelle réponse reste possible", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Libellé", { exact: true }).fill("Nom");
  await page
    .getByRole("button", { name: "Ajouter au formulaire", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enregistrer le formulaire", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Nouvelle réponse", exact: true })
    .click();
  await page.getByLabel("Nom", { exact: true }).fill("Alice");
  await page.locator("form").evaluate((form: HTMLFormElement) => {
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect(
    page.getByRole("button", { name: "Réponses (1)", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.allAnswers).length),
  ).toBe(1);
  await page
    .getByRole("button", { name: "Formulaires (1)", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Nouvelle réponse", exact: true })
    .click();
  await page.getByLabel("Nom", { exact: true }).fill("Bob");
  await page
    .getByRole("button", { name: "Enregistrer la réponse", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Réponses (2)", exact: true }),
  ).toBeVisible();
});
