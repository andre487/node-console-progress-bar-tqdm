module.exports = function example({title, description, tags, run, file}) {
    if (!title) {
        throw new Error('`title` is required');
    }
    if (!description) {
        description = title;
    }
    if (typeof run !== 'function') {
        throw new Error('`func` is required');
    }
    if (!file) {
        throw new Error('`file` is required');
    }
    tags = tags || [];
    return {
        title,
        description,
        tags,
        run,
        file,
    };
};
