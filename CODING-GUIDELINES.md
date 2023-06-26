# Coding guidelines

In order to contribute to this project, please follow the below code formatting guidelines.

## Template

## Typescript

### Injecting services

Inject services into components with `private readonly`:

#### **`test.component.ts`**

```typescript
...

constructor(private readonly testService: TestService) {

}

...
```

### Property access modifiers

All properties and methods in a class should be marked with access modifiers.

#### Private

Any properties not used outside of a component, should be marked as private.
The property name should be prefixed with an underscore: `private _testProperty: string;`.

#### Readonly

Any properties with a constant reference, should be marked as readonly. For example:
`public readonly testObservable$ = new BehaviourSubject<string>('')`.

#### Constants

All constant properties should be written in screaming snake case: `public readonly MY_VALUE = 'my value';'`

### Property typing

Unless initialized with a primitive, all properties and methods should have a return type specified:

#### **`test.component.ts`**

```typescript
...

public myProperty!: TestObject;

private _myString  = 'test';

public myVoidFunction(testParams: TestParam): void {
    ...
}

private myTestFunction(testParams: TestParam): TestResult {
    let testResult!: TestResult;

    ...

    return testresult
}


...
```

### Preferred class property order

As much possible, please keep to the following ordering of properties in Angular classes:

- Property decorators like `ViewChild`, `ViewChildren` etc.
- `Input()`
- `Output()`
- Public properties
- Public readonly properties
- Private properties
- Private readonly property
- Getters/setters
- Constructor
- Angular lifecycle hooks
  - ngOnInit
  - ngAfterViewInit
  - ngOnChanges
  - ngOnDestroy
- Public methods
- Private methods
