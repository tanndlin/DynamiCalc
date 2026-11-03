import { layer, type EditorView, type LayerMarker } from '@codemirror/view';
import { activeLine, resultsField } from './editor';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface Wire {
    d: string;
    kind: 'uses' | 'used-by';
}

interface Geometry {
    width: number;
    height: number;
    wires: Wire[];
    node: { x: number; y: number } | null;
}

class WiresMarker implements LayerMarker {
    constructor(
        readonly geometry: Geometry,
        readonly key: string
    ) {}

    eq(other: LayerMarker): boolean {
        return other instanceof WiresMarker && other.key === this.key;
    }

    draw() {
        const { width, height, wires, node } = this.geometry;
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('class', 'nb-wires');
        svg.setAttribute('width', `${width}`);
        svg.setAttribute('height', `${height}`);
        svg.setAttribute('aria-hidden', 'true');

        for (const wire of wires) {
            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('d', wire.d);
            path.setAttribute('class', `nb-wire nb-wire--${wire.kind}`);
            path.setAttribute('pathLength', '1');
            svg.appendChild(path);
        }

        if (node) {
            const dot = document.createElementNS(SVG_NS, 'circle');
            dot.setAttribute('cx', `${node.x}`);
            dot.setAttribute('cy', `${node.y}`);
            dot.setAttribute('r', '3.5');
            dot.setAttribute('class', 'nb-wire-node');
            svg.appendChild(dot);
        }

        const wrapper = document.createElement('div');
        wrapper.appendChild(svg);
        return wrapper;
    }

    update(dom: HTMLElement, previous: LayerMarker): boolean {
        // Redraw from scratch; the SVG is tiny
        if (previous instanceof WiresMarker && previous.key === this.key) {
            return true;
        }
        dom.replaceWith(this.draw());
        return true;
    }
}

const ARROW = 4;

/** Draws a wire that leaves `from`, loops through the margin, and enters `to`. */
const wirePath = (x: number, from: number, to: number, reach: number) => {
    const bend = x - reach;
    return [
        `M ${x} ${from}`,
        `C ${bend} ${from}, ${bend} ${to}, ${x} ${to}`,
        // Arrowhead pointing into the line
        `M ${x - ARROW} ${to - ARROW} L ${x} ${to} L ${x - ARROW} ${to + ARROW}`
    ].join(' ');
};

const measure = (view: EditorView): WiresMarker | null => {
    const results = view.state.field(resultsField);
    const active = activeLine(view.state);
    const current = results[active];
    if (!current) {
        return null;
    }

    const uses = current.directUses;
    const usedBy = results
        .map((r, line) => (r.directUses.includes(active) ? line : -1))
        .filter((line) => line >= 0);
    if (uses.length === 0 && usedBy.length === 0) {
        return null;
    }

    const scroller = view.scrollDOM.getBoundingClientRect();
    const content = view.contentDOM.getBoundingClientRect();
    const gutter = parseFloat(
        getComputedStyle(
            view.contentDOM.querySelector('.cm-line') ?? view.contentDOM
        ).paddingLeft
    );
    const offsetTop =
        view.documentTop - scroller.top + view.scrollDOM.scrollTop;
    const left = content.left - scroller.left + view.scrollDOM.scrollLeft;
    const x = left + gutter - 10;
    const lineHeight = view.defaultLineHeight;

    const yOf = (line: number) => {
        const block = view.lineBlockAt(view.state.doc.line(line + 1).from);
        return offsetTop + block.top + lineHeight / 2;
    };

    const yActive = yOf(active);
    const maxReach = Math.max(8, x - left - 6);
    const reachFor = (y: number) =>
        Math.min(maxReach, 8 + Math.abs(y - yActive) * 0.12);

    const wires: Wire[] = [
        ...uses.map((line) => {
            const y = yOf(line);
            return {
                d: wirePath(x, y, yActive, reachFor(y)),
                kind: 'uses' as const
            };
        }),
        ...usedBy.map((line) => {
            const y = yOf(line);
            return {
                d: wirePath(x, yActive, y, reachFor(y)),
                kind: 'used-by' as const
            };
        })
    ];

    const geometry: Geometry = {
        width: x + ARROW + 2,
        height: view.contentHeight,
        wires,
        node: { x: x + 1, y: yActive }
    };
    const key = JSON.stringify([
        geometry.wires,
        geometry.node,
        geometry.height
    ]);
    return new WiresMarker(geometry, key);
};

/** Margin wires linking the cursor's line to the lines it uses and feeds. */
export const dependencyWires = layer({
    above: false,
    class: 'nb-wires-layer',
    markers(view) {
        const marker = measure(view);
        return marker ? [marker] : [];
    },
    update(update) {
        return (
            update.docChanged ||
            update.selectionSet ||
            update.geometryChanged ||
            update.viewportChanged
        );
    }
});
