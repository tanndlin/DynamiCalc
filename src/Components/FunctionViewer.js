import React from 'react';

const FunctionViewer = (props) => {
    const { fn, edit } = props;

    const onEdit = (e) => {
        const newFn = { ...fn };
        newFn.f = e.target.value;
        edit(newFn);
    };

    return (
        <div className="">
            <input
                className="text-black"
                type="text"
                value={fn.f}
                onChange={onEdit}
            />
        </div>
    );
};

export default FunctionViewer;
