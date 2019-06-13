import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { EmailContent } from '../../models/email-modal/email-modal.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError, share } from 'rxjs/operators';
import { PgConstants } from '../../constants/pg.constants';

@Injectable()
export class EmailModalService {
  constructor(private http: HttpClient) { }
  isShowing = false;
  modal = new Subject();
  emailContent = new Subject<EmailContent>();

  getModal() {
    return this.modal;
  }

  getEmailContent() {
    return this.emailContent;
  }

  open(domainId, isMultiview) {
    this.isShowing = true;
    var content = new EmailContent();
      content.DomainId = domainId;
      if (domainId['isMultiview'] != undefined && domainId['isMultiview'] == false) {
          content.IsMultiView = false;
          content.DomainId = domainId['domainId'];
      } else {
          content.IsMultiView = isMultiview;
      }
    
    this.emailContent.next(content);
    this.modal.next(true);
  }
  close() {
    this.isShowing = false;
    this.modal.next(false);
  }
  closeModal() {
    this.close();
  }

  public sentContentEmail(input): Observable<boolean> {
    return this.http.post<any[]>(PgConstants.constants.WEBAPIURLS.SendContentEmail, input, { withCredentials: false })
      .pipe(
      timeout(300000),
      share(),
      catchError((error: Response) => Observable.throw(error))
      );
  };
}
