import React, { useEffect } from 'react';

function EditableText(props) {
    function onBlur(e) {
        props.onBlur && props.onBlur(e);
    }

    function onChange(e) {
        props.onChange(e);

        const span = document.getElementById('fakeSpan');
        span.innerHTML = e.target.value.replace(/\s/g, '&nbsp;');
        e.target.style.width = span.offsetWidth + 'px';
    }

    useEffect(() => {
        const span = document.getElementById('fakeSpan');
        span.innerHTML = `${props.value}`.replace(/\s/g, '&nbsp;');
        document.getElementById(props.id).style.width =
            span.offsetWidth + 10 + 'px';
    }, []);

    return (
        <div className={`editableContainer ${props.className}`}>
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
