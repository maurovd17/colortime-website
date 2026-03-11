# colortime-website
Website voor Colortime – schilder- en behangwerken uit Aalst.

## Structuur
- `index.html`, `werken.html`, `over-ons.html`, `contact.html` en detailpagina's bevatten de hoofdcontent.
- `partials/header.html` en `partials/footer.html` zijn gedeelde onderdelen die dynamisch ingeladen worden door `scripts/main.js`.
- `style.css` bevat alle CSS; er worden variabelen gebruikt voor kleuren en typografie.
- `scripts/main.js` verzorgt het hamburgermenu, het laden van partials en de lightbox voor foto’s.
- Afbeeldingen staan in de `images/` map.

## Bijwerken
- Voeg nieuwe projecten toe in `werken.html` door een `<div class="project">` met `<img>` toe te voegen; lichtbak &amp; link naar detailpagina werken automatisch. (Er zijn ondertussen al voorbeelden met `werk1.2.jpg`, `werk1.3.jpg` en `werk1.4.jpg`.)
- Maak een nieuwe detailpagina door een bladzijde te kopiëren van een bestaande `detail-*.html` en de inhoud aan te passen.
- Stijlen veranderen gaat via variabelen bovenaan `style.css`.

## Extra tips
- Voor SEO kun je metadata aanpassen in de `<head>` secties van de HTML-bestanden.
- Vergeet niet afbeeldingen te optimaliseren (kleine bestandsgrootte, juiste afmetingen).
- Kopieer de header/footer als je offline zonder JavaScript wilt werken, maar in de meeste gevallen laat je de fetch-scripts het werk doen.

Veel succes met verder uitbouwen van de Colortime-website!