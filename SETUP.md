# CMS-Einrichtung – Schmalzried Haus- und Gebäudetechnik

Das Login ist **bereits eingerichtet** und komplett getrennt von den anderen
Kundenwebsites: kein GitHub-Account nötig, nur E-Mail + Passwort. Technisch
läuft das über einen eigenen, nur für diese Website zuständigen
Cloudflare-Worker (`cms-auth-schmalzried-heizung`). Zugangsdaten hat Hannes.
Passwort ändern: `wrangler secret put AUTH_PASSWORD_HASH` im Ordner
`cms-auth-workers/schmalzried-heizung` (Hash mit
`node generate-credentials.js <neues-passwort>` erzeugen).

Voraussetzung: Das Repo `Hannes0777/schmalzried-heizung` (Branch `main`) ist
bei einem Hosting-Anbieter verbunden, der bei jedem Push automatisch neu
veröffentlicht (z.B. Cloudflare Pages oder GitHub Pages).

---

## Was ist `/admin`?

Unter `https://ihre-domain/admin` öffnet sich ein einfaches
Bearbeitungs-Werkzeug (Sveltia CMS). Nach dem Login mit E-Mail und Passwort
kann der Betrieb dort Texte, Preise, Leistungen und Kontaktdaten selbst ändern –
ganz ohne Programmierkenntnisse. Jede Speicherung erstellt automatisch
einen Commit im GitHub-Repo, der die Website innerhalb weniger Minuten
aktualisiert.

## Was kann der Betrieb bearbeiten?

| Bereich im CMS | Was ändert sich auf der Website |
|---|---|
| 🔧 Leistungen | Die 5 Leistungskarten auf der Startseite – Titel, Text, Icon, hinzufügen/entfernen |
| 📸 Referenzprojekte | Die 4 Projektkarten im Bereich „Referenzprojekte" |
| 🏛 Über uns | Die beiden Textabsätze, die Häkchen-Liste und die zwei Kennzahlen (z.B. „20+ Jahre Erfahrung") |
| ⚙️ Allgemeine Seiteninfos | Seitentitel, Meta-Beschreibung, Social-Media-Vorschau |
| ⚙️ Startseite | Überschrift, Untertitel und die 4 Vertrauens-Badges im Willkommensbereich |
| ⚙️ Kontakt & Adresse | **Telefonnummer** (siehe unten), Ort, Bürozeiten, Notdienst-Zeiten, Einzugsgebiet, Karten-Standort |

### Wichtiger Hinweis zur Telefonnummer

Die Telefonnummer war bisher nirgends eingetragen (Platzhalter
„[TELEFONNUMMER]") und erschien dadurch fehlerhaft an sieben Stellen der
Seite (Notfall-Banner, Startseite, mobiles Menü, Notdienst-Karte,
Kontaktformular-Erfolgsmeldung, Kontaktbereich, Fußzeile). Das ist jetzt
behoben: Sobald der Betrieb im CMS unter **⚙️ Einstellungen → Kontakt &
Adresse** die Felder „Telefonnummer" und „Telefonnummer für Anruf-Links"
ausfüllt, wird die Nummer automatisch an **allen** diesen Stellen korrekt
angezeigt und verlinkt – ein einziges Eintragen genügt.

## Bilder & Dateien

Hochgeladene Bilder landen automatisch im Ordner `/uploads/` und sind
sofort über `/uploads/dateiname.jpg` erreichbar. Diese Runde enthält noch
keine Bild-Upload-Felder (Fotos sind weiterhin fest im Template
hinterlegt) – das lässt sich bei Bedarf später leicht ergänzen.

## Workflow für den Betrieb

```
1. ihre-domain/admin öffnen
2. Mit E-Mail + Passwort anmelden
3. Inhalt bearbeiten & auf „Speichern" klicken
4. → Im Hintergrund wird automatisch ein Commit erstellt
5. → Die Website baut & veröffentlicht sich in ca. 1–2 Minuten neu
```

## Troubleshooting

| Problem | Lösung |
|---|---|
| E-Mail/Passwort falsch | Zugangsdaten bei Hannes erfragen; Passwort kann jederzeit neu gesetzt werden (siehe oben) |
| „Zu viele Anmeldeversuche" | Kurz warten (unter einer Minute) und erneut versuchen |
| Änderungen erscheinen nicht | 1–2 Minuten warten (Build-Zeit des Hosting-Anbieters); Browser-Cache leeren |
