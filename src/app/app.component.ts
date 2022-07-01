import { Component, OnInit } from '@angular/core';

declare var docx2html: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
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
        let everyChild = document.querySelectorAll("#doc2html-container i");
        for (let i = 0; i < everyChild.length; i++) {
          console.log(everyChild[i].id);
          ids.push(everyChild[i].id);
        }
        console.log(ids);
        this.ids = ids;
      })
  }
}
