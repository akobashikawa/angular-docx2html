# Docx2html en Angular

docx2html es una biblioteca javascript que permite visualizar un documento doc.

Pero cómo usarlo en Angular?

Este proyecto muestra una manera.
## Instalación y despliegue

Este es un proyecto generado con [Angular CLI](https://github.com/angular/angular-cli) version 14.0.2, así que puede proceder como de costumbre.

```bash
$ npm install
$ ng serve
```

## docx2html

[docx2html](https://github.com/lalalic/docx2html) es un convertidor javascript de docx a html. Ya sea en node como en el browser. Esta es una [demo](http://lalalic.github.io/docx2html/).

`index.html`
```html
<input type="file" onchange="onFileSelected(this)" />
<div id="docx2html-container"></div>
<script src="http://lalalic.github.io/docx2html/index.js"></script>
<script>
  function onFileSelected(input){
    require("docx2html")(input.files[0],{container:document.querySelector("#docx2html-container")})
      .then(html=>{
        console.log(html.content);
        // problema: mostrar todos los bookmarks del documento
        // pista: estos son transformados en tags i 
        let ids = []
        let everyChild = html.content.querySelectorAll("i");
        for (let i = 0; i < everyChild.length; i++) {
          console.log(everyChild[i].id);
          ids.push(everyChild[i].id);
        }
        console.log(ids);
      })
  }
</script>
```

## Portando la solución a angular
- Vemos que necesitaremos hacer uso de elementos del DOM:
  - `#docx2html-container`
  - `#docx2html-container i`
- La biblioteca es un módulo pero no del tipo que puede ser importado directamente como módulo de angular.
  - `$ npm install --save docx2html`
  - `$ ls node_modules/docx2html/dist/docx2html.js`
    - Versión para node
  - `$ ls node_modules/docx2html/dist/index.js`
    - Versión para el browser

### Intento 1: KO
`angular.json`
```json
  "build:..."
    "scripts": [
      "node_modules/docx2html/dist/index.js"
    ]
  "test:..."
    "scripts": [
      "node_modules/docx2html/dist/index.js"
    ]
```

`src\index.html`
```html
<app-root></app-root>
<script>
console.log('docx2html', require('docx2html'));
</script>
```

- Parece como si el script `node_modules/docx2html/dist/index.js` no fuera cargado.
  - Revisando en el inspector, veo que sí es cargado y combinado dentro de `scripts.js`
  - Pero no funciona

### Intento 2: OK
- Deshago los cambios previos en `angular.json`
`src\index.html`
```html
<app-root></app-root>
<script src="http://lalalic.github.io/docx2html/index.js"></script>
<script>
console.log('docx2html', require('docx2html'));
</script>
```

- Cargo el script directamente del CDN

### Técnica de carga diferida
- Consiste en exponer `docx2html` a través del objeto `window` y luego cargarlo en el componente angular.

`src/index.html`
```html
<app-root></app-root>
<div id="doc2html-container"></div>
<script src="http://lalalic.github.io/docx2html/index.js"></script>
<script>
  window.docx2html = require('docx2html');
</script>
```

`src/app/app.component.ts`
```ts
declare var docx2html: any;
//...
export class AppComponent implements OnInit {
  docx2html: any;

  ngOnInit(): void {
    this.docx2html = docx2html;
    console.log('docx2html', docx2html);
  }
}

```

- Ahora ya tenemos a `doc2html` disponible en el componente, y `doc2html` cuenta con un elemento `#docx2html-container`, del DOM, que puede usar.

## La solución
`src/index.html`
```html
<app-root></app-root>
<div id="doc2html-container"></div>
<script src="http://lalalic.github.io/docx2html/index.js"></script>
<script>
  window.docx2html = require('docx2html');
</script>
```

`src/app/app.component.html`
```html
<h1>docx2html</h1>
<input type="file" (change)="onFileSelected($event)">
<ul>
  <li *ngFor="let id of ids">
    {{ id }}
  </li>
</ul>
```

`src/app/app.component.ts`
```ts
declare var docx2html: any;
//...
export class AppComponent implements OnInit {
  title = 'docx2html';
  docx2html: any;
  ids: any = [];

  ngOnInit(): void {
    this.docx2html = docx2html;
    console.log('docx2html', docx2html);
  }

  onFileSelected(event: any) {
    console.log('onFileSelected', event.target.files[0]);
    this.docx2html(event.target.files[0], { container: document.querySelector("#doc2html-container") })
      .then((html:any) => {
        console.log(html.content);
        let ids = []
        let everyChild = html.content.querySelectorAll("i");
        for (let i = 0; i < everyChild.length; i++) {
          console.log(everyChild[i].id);
          ids.push(everyChild[i].id);
        }
        console.log(ids);
        this.ids = ids;
      })
  }
}

```

- Si no se quiere mostrar, `#doc2html-container` se puede ocultar con algo como:

```html
<div id="doc2html-container" style="width:0;height:0;"></div>
```

- Si se quiere una copia local, `http://lalalic.github.io/docx2html/index.js`, `node_modules/docx2html/dist/index.js`, se puede copiar como `assets/docx2html.browser.js`

```html
<script src="assets/docx2html.browser.js"></script>
```
