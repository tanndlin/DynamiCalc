import React, { useEffect } from 'react';

interface EditableTextProps {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    className?: string;
    type?: string;
}

const measure = (text: string): number => {
    const span = document.getElementById('fakeSpan');
    if (!span) {
        return 0;
    }

    span.innerHTML = text.replace(/\s/g, '&nbsp;');
    return span.offsetWidth;
};

function EditableText(props: EditableTextProps) {
    function onBlur(e: React.FocusEvent<HTMLInputElement>) {
        props.onBlur?.(e);
    }

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        props.onChange(e);
        e.target.style.width = measure(e.target.value) + 'px';
    }

    // Only size the input on mount
    useEffect(() => {
        const input = document.getElementById(props.id);
        if (input) {
            input.style.width = measure(`${props.value}`) + 10 + 'px';
        }
    }, []);

    return (
        <div className={`editableContainer ${props.className ?? ''}`}>
            <input
                id={props.id}
                onChange={onChange}
                onBlur={onBlur}
                className="editable"
                type={props.type}
                value={props.value}
            />
            <span id="fakeSpan"></span>
        </div>
    );
}

export default EditableText;
