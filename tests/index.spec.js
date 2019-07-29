import Cancellable from '../src/index.js';

describe('Cancellable.js', () => {
    describe('#create() should not affect original task\s', () => {
        it('nominal workflow', async () => {
            const taskResult   = 'some tasks result';
            const task         = jest.fn().mockResolvedValue(taskResult);
            const taskCallArgs = [1, 2, 'a', 'b'];

            const cancellableTask = Cancellable.create(task);

            expect(await cancellableTask(...taskCallArgs)).toBe(taskResult);
            expect(task).toBeCalledWith(...taskCallArgs);
        });

        it('error flow', async () => {
            const taskResult = new Error('test');
            const task       = jest.fn().mockRejectedValue(taskResult);

            const cancellableTask = Cancellable.create(task);

            await expect(cancellableTask()).rejects.toEqual(taskResult);
        });
    });

    describe('cancellation', () => {
        it('should work correctly in nominal flow', async () => {
            const task               = jest.fn().mockResolvedValue();
            const cancellableTask    = Cancellable.create(task);
            const nonCancellableTask = jest.fn().mockResolvedValue();

            const flow = async () => {
                await cancellableTask();
                await nonCancellableTask();
            };

            const promiseFlow = flow();

            Cancellable.cancel(cancellableTask);

            let isCancelled = false;

            try {
                await promiseFlow;
            } catch (error) {
                isCancelled = Cancellable.isCanceled(error);
            }

            await expect(isCancelled).toEqual(true);

            expect(task).toBeCalled();
            expect(nonCancellableTask).not.toBeCalled();
        });

        it('should work correctly when cancel was called after all', async () => {
            const task               = jest.fn().mockResolvedValue();
            const cancellableTask    = Cancellable.create(task);
            const nonCancellableTask = jest.fn().mockResolvedValue();
            const flow               = async () => {
                await cancellableTask();
                await nonCancellableTask();
            };

            const promiseFlow = flow();

            let isCancelled = false;

            try {
                await promiseFlow;
                Cancellable.cancel(cancellableTask);
            } catch (error) {
                isCancelled = Cancellable.isCanceled(error);
            }

            await expect(isCancelled).toEqual(false);

            expect(task).toBeCalled();
            expect(nonCancellableTask).toBeCalled();
        });

        it('should work correctly with multiple cancellable tasks', async () => {
            const task1              = jest.fn().mockResolvedValue();
            const cancellableTask1   = Cancellable.create(task1);
            const task2              = jest.fn().mockResolvedValue();
            const cancellableTask2   = Cancellable.create(task1);
            const nonCancellableTask = jest.fn().mockResolvedValue();

            const flow = async () => {
                await cancellableTask1();
                await cancellableTask2();
                await nonCancellableTask();
            };

            const promiseFlow = flow();

            Cancellable.cancel(cancellableTask2, cancellableTask1);

            let isCancelled = false;

            try {
                await promiseFlow;
            } catch (error) {
                isCancelled = Cancellable.isCanceled(error);
            }

            await expect(isCancelled).toEqual(true);

            expect(task1).toBeCalled();
            expect(task2).not.toBeCalled();
            expect(nonCancellableTask).not.toBeCalled();
        });
    });
});
