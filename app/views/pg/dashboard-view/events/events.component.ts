import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  @Input() calenderEvents: any;
  @Input() eventsError: string;

  constructor() { }

  ngOnInit() {
  }

}
