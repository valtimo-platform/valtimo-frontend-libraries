import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Route} from '@angular/router';

@Component({
  selector: 'app-exact-redirect',
  templateUrl: './exact-redirect.component.html'
})
export class ExactRedirectComponent
  implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      localStorage.setItem('exactAuthorizationCode', params.code);
      window.close()
    });
  }

  ngOnDestroy() {
  }

}
