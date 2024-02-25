module.exports = function example({title, description, run}) {
    if (!title) {
        throw new Error('`title` is required');
    }
    if (!description) {
        description = title;
    }
    if (typeof run !== 'function') {
        throw new Error('`func` is required');
    }
    return {title, description, run};
};
