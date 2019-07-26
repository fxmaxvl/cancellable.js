# cancellable.js WIP
Simple tool for creating cancellable promise-returning/async functions.

### How to use
```javascript
import Cancellable from 'cancellable.js';

// use case: with single cancellable function

const doSomeAsyncStaff = () => new Promise(res => setTimeout(res, 1000));
const doSomeSyncStaff  = () => null;

const doSomeAsyncStaffCancellable = Cancellable.create(doSomeAsyncStaff);

async function useSingleAsyncStaff() {
    try {
        await doSomeAsyncStaffCancellable();
        doSomeSyncStaff();
    } catch (error) {
        if (Cancellable.isCanceled(error)) {
            // handle cancellation case or do nothing
           
            return;
        }
        
        // your regular error handling logic
    }
}

useSingleAsyncStaff();

Cancellable.cancel(doSomeAsyncStaffCancellable);

// use case: with multiple cancellable functions

const doSomeAsyncStaff      = () => new Promise(res => setTimeout(res, 1000));
const doSomeOtherAsyncStaff = () => new Promise(res => setTimeout(res, 2000));
const doSomeSyncStaff       = () => null;

const doSomeAsyncStaffCancellable      = Cancellable.create(doSomeAsyncStaff);
const doSomeOtherAsyncStaffCancellable = Cancellable.create(doSomeOtherAsyncStaff);

async function useMultipleAsyncStaff() {
    try {
        await doSomeAsyncStaffCancellable();
        await doSomeOtherAsyncStaffCancellable();
        doSomeSyncStaff();
    } catch (error) {
        if (Cancellable.isCanceled(error)) {
            // handle cancellation case or do nothing
           
            return;
        }
        
        // your regular error handling logic
    }
}

useMultipleAsyncStaff();

// it is possible to cancel several cancellable functions at onсe
Cancellable.cancel(doSomeAsyncStaffCancellable, doSomeOtherAsyncStaffCancellable);

```

