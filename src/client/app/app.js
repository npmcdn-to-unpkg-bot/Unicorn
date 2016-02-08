var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/*
 * Angular 2 decorators and services
 */
var core_1 = require('angular2/core');
var router_1 = require('angular2/router');
var common_1 = require('angular2/common');
var router_active_1 = require('./directives/router-active');
var home_1 = require('./home/home');
/*
 * App Component
 * Top Level Component
 */
let App = class {
    constructor() {
        this.angularclassLogo = 'assets/img/angularclass-avatar.png';
        this.name = 'Angular 2 Webpack Starter';
        this.url = 'https://twitter.com/AngularClass';
    }
};
App = __decorate([
    core_1.Component({
        selector: 'app',
        providers: [...common_1.FORM_PROVIDERS],
        directives: [...router_1.ROUTER_DIRECTIVES, router_active_1.RouterActive],
        pipes: [],
        styles: [`
    nav ul {
      display: inline;
      list-style-type: none;
      margin: 0;
      padding: 0;
      width: 60px;
    }
    nav li {
      display: inline;
    }
    nav li.active {
      background-color: lightgray;
    }
  `],
        template: `
    <header>
      <nav>
        <h1>Hello {{ name }}</h1>
        <ul>
          <li router-active>
            <a [routerLink]=" ['Index'] ">Index</a>
          </li>
          <li router-active>
            <a [routerLink]=" ['Home'] ">Home</a>
          </li>
          <li router-active>
            <a [routerLink]=" ['About'] ">About</a>
          </li>
        </ul>
      </nav>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>

    <footer>
      WebPack Angular 2 Starter by <a [href]="url">@AngularClass</a>
      <div>
        <img [src]="angularclassLogo" width="10%">
      </div>
    </footer>
  `
    }),
    router_1.RouteConfig([
        { path: '/', component: home_1.Home, name: 'Index' },
        { path: '/home', component: home_1.Home, name: 'Home' },
        // Async load a component using Webpack's require with es6-promise-loader
        { path: '/about', loader: () => require('./about/about')('About'), name: 'About' },
        { path: '/**', redirectTo: ['Index'] }
    ])
], App);
exports.App = App;
/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 * or via chat on Gitter at https://gitter.im/AngularClass/angular2-webpack-starter
 */
