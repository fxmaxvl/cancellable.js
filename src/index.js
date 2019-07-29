const C_METHOD = Symbol('C_METHOD');
const C_TOKEN  = Symbol('C_TOKEN');

export default class Cancellable {
    /**
     * @param {function} task
     * @returns {function(...[*]): Promise<any>}
     * @throws {TypeError}
     */
    static create(task) {
        if (typeof task !== 'function') {
            throw new TypeError('task must be a function');
        }

        function cancellableTask(...args) {
            const cancellable = new Promise((res, rej) => {
                cancellableTask[C_METHOD] = () => rej(C_TOKEN);
            });

            return Promise.race([cancellable, task.call(this, ...args)]);
        }

        return cancellableTask;
    }

    /**
     * @param {*|Symbol<'C_TOKEN'>} maybeToken
     * @returns {boolean}
     */
    static isCanceled(maybeToken) {
        return maybeToken === C_TOKEN;
    }

    /**
     * @param {function[]} tasks
     */
    static cancel(...tasks) {
        tasks.forEach(task => {
            if (task && task[C_METHOD]) {
                task[C_METHOD]();
            }
        });
    }
}
