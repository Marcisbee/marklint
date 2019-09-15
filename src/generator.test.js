const {
  HTMLMarkup,
} = require('./tokens');
const parse = require('./parser');
const generator = require('./generator');

describe('generator', () => {
  test('should export `generator` as a function', () => {
    expect(typeof generator).toBe('function');
  });

  test('should generate empty markup', () => {
    const expectation = ``;
    const input = new HTMLMarkup({
      start: 0,
      end: 0,
      children: [],
      raw: '',
      sourceType: 'HTML',
    });

    const output = generator(input);

    expect(output.code).toEqual(expectation);
  });

  test.each([
    `Hello World!`,
    `
    1. Foo
    2. Bar
    `,
    `<strong></strong>`,
    `
    <span></span>
    `,
    `<a></a><b></b>`,
    `<a-tag></a-tag><b-tag></b-tag>`,
    `<foo/>`,
    `<foo></bar>`,
    `<foo><bar></bar></foo>`,
    `0<foo>a<bar>b</bar>c</foo>1`,
    `<meta/>`,
    `<meta />`,
    `<meta  />`,
    `<meta data/>`,
    `<meta data />`,
    `<meta data= />`,
    `<meta data=data2 />`,
    `<meta data="" />`,
    `<meta data="123"/>`,
    `<meta data="\"text\"" />`,
    `<meta no-value string="foo" number=3 />`,
    `<meta
      no-value
        string="foo"
    number=3
    />`,
    `<-- this is a comment -->`,
    `<!DOCTYPE attr>`,

    // VUE
    `<span>Message: {{ msg }}</span>`,
    `<div v-bind:id="dynamicId"></div>`,
    `<form v-on:submit.prevent="onSubmit"> ... </form>`,
    `<a :href="url"> ... </a>`,
    `<a @click="doSomething"> ... </a>`,

    // Angular 2
    `<h3>Current customer: {{ currentCustomer }}</h3>`,
    `<div><img src="{{itemImageUrl}}"></div>`,
    `<img [src]="itemImageUrl2">`,
    `<li *ngFor="let customer of customers">{{customer.name}}</li>`,
    `<input #customerInput>{{customerInput.value}}</input>`,
    `<button (click)="deleteHero()">Delete hero</button>`,
    `<input [attr.disabled]="condition ? 'disabled' : null">`,
    `<input [(ngModel)]="name">`,
    `<button [style.font-size.%]="!isSpecial ? 150 : 50" >Small</button>`,
  ])('should generate "%s"', (expectation) => {
    const input = parse(expectation);

    const output = generator(input);

    expect(output.code).toEqual(expectation);
  });
});
