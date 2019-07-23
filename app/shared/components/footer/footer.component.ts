import { Component, OnInit } from '@angular/core';
import { PgConstants } from '../../../shared/constants/pg.constants';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
    year: number = new Date().getFullYear();
    pgConstants = PgConstants.constants;
  constructor() {
    this.year = new Date().getFullYear();
  }

  ngOnInit() {
  }

}
