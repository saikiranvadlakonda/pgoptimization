import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {

  @Input() files: any;
  @Input() fileError: any;
  @Output() navigateToContent: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteFile: EventEmitter<any> = new EventEmitter<any>();
  
  constructor() { }

  ngOnInit() {
  }

  onNavigateToContent(file: any): void {
    this.navigateToContent.emit(file);
  }

  onDeleteFile(file: any): void {
  this.deleteFile.emit(file);
  }

}
