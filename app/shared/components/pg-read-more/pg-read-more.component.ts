import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'pg-read-more',
  templateUrl: './pg-read-more.component.html',
  styleUrls: ['./pg-read-more.component.css']
})
export class PgReadMoreComponent implements OnInit {

  @Input() text: string;
  @Input() linkText: string;
  @Input() limitCount: string;

  public truncatedText = false;
  public readMoreLabelText = 'READ MORE +';
  public limit: number;

  constructor() {
      if (this.limitCount != null && this.limitCount != undefined && this.limitCount != "")
          this.limit = parseInt(this.limitCount);
      else
          this.limit = 300;

    this.truncatedText = false;
  }

  toggleText(): void {
    if (this.truncatedText === true) {
      this.truncatedText = false;
      this.readMoreLabelText = 'READ MORE +';
    }
    else if (this.truncatedText === false) {
      this.truncatedText = true;
      this.readMoreLabelText = 'READ LESS -';
    }
    else {
      this.truncatedText = true;
    }
  }

  ngOnInit() {
      if (this.limitCount != null && this.limitCount != undefined && this.limitCount != "")
          this.limit = parseInt(this.limitCount);
      else
          this.limit = 300;
  }


}
