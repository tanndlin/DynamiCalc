import React from 'react';
import { CompactPicker } from 'react-color';

const FunctionViewer = (props) => {
    const { fn, edit } = props;
    const { f, color } = fn;

    const onEdit = (e) => {
        const newFn = { ...fn };
        newFn.f = e.target.value;
        edit(newFn);
    };

    const editColor = (color) => {
        const newFn = { ...fn };
        newFn.color = color.hex;
        edit(newFn);
    };

    return (
        <div className="relative function shadow-tertiary shadow-md p-4 w-full rounded-md flex flex-col">
            <input
                className="close"
                type="button"
                value="&times;"
                onClick={props.delete}
            />
            <input
                className="text-black w-9/10 px-2 py-1 rounded-md"
                type="text"
                value={f}
                onChange={onEdit}
            />

            <footer className="picker">
                <CompactPicker color={color} onChange={editColor} />
            </footer>
        </div>
    );
};

export default FunctionViewer;
