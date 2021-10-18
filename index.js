//@ts-check

(function () {
  /**
   * Entry point.
   */
  function main() {
    // Data
    const figures = [
      new Figure(new Point(22, 31), new Point(35, 27), new Point(6, 8)),
      new Figure(new Point(40, 25), new Point(54, 9), new Point(12, 7)),
      new Figure(
        new Point(44, 30),
        new Point(68, 12),
        new Point(59, 8),
        new Point(42, 28),
      ),
      new Figure(
        new Point(42, 36),
        new Point(63, 36),
        new Point(89, 30),
        new Point(73, 13),
      ),
      new Figure(
        new Point(74, 37),
        new Point(95, 37),
        new Point(91, 31),
        new Point(74, 35),
      ),
    ];

    // Model
    const model = new ProblemModel(
      new Painter(document.querySelector('.canvas')),
      new Point(30, 0),
      new Point(60, 40),
      figures,
    );
    model.solve().paint();

    const manager = new FigureBlockManager(
      document.querySelector('.js-figure-container'),
    );

    // Init DOM events listeners.
    listenWindowResize(model);
    listenFigureAdd(document.querySelector('.js-figure-create'), manager);
    listenFigureRemove(document.querySelector('.js-figure-delete'), manager);
    listenSubmit(document.querySelector('.js-form'), model);

    // Init add/remove vertex event listeners to all existing buttons.
    document.querySelectorAll('.js-figure').forEach(container => {
      const vertices = container.querySelector('.js-vertices');
      if (!(vertices instanceof HTMLElement)) throw Error();
      const [add, remove] = container.querySelectorAll('.button');
      const manager = new VerticesBlockManager(vertices);
      add.addEventListener('click', () => {
        manager.create();
      });
      remove.addEventListener('click', () => {
        manager.delete();
      });
    });
  }

  /**
   * @param {ProblemModel} model
   */
  function listenWindowResize(model) {
    window.addEventListener('resize', () => {
      model.paint();
    });
  }

  /**
   * @param {HTMLElement} element
   * @param {FigureBlockManager} manager
   */
  function listenFigureAdd(element, manager) {
    element.addEventListener('click', () => {
      manager.create();
    });
  }

  /**
   * @param {HTMLElement} element
   * @param {FigureBlockManager} manager
   */
  function listenFigureRemove(element, manager) {
    element.addEventListener('click', () => {
      manager.delete();
    });
  }

  /**
   * @param {HTMLFormElement} form
   * @param {ProblemModel} model
   */
  function listenSubmit(form, model) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      // Parse coordinates of point A and point B
      const pointAX = parseFloat(form['point-a-x'].value);
      if (isNaN(pointAX)) throw TypeError();
      const pointAY = parseFloat(form['point-a-y'].value);
      if (isNaN(pointAY)) throw TypeError();
      const pointBX = parseFloat(form['point-b-x'].value);
      if (isNaN(pointBX)) throw TypeError();
      const pointBY = parseFloat(form['point-b-y'].value);
      if (isNaN(pointBY)) throw TypeError();
      model.setPointA(new Point(pointAX, pointAY));
      model.setPointB(new Point(pointBX, pointBY));

      // Parse all figures
      const figures = [];
      document.querySelectorAll('.js-vertices').forEach(container => {
        const points = [];
        container.querySelectorAll('.js-vertex').forEach(vertex => {
          const [inputX, inputY] = vertex.querySelectorAll('input');
          const x = parseFloat(inputX.value);
          if (isNaN(x)) throw TypeError();
          const y = parseFloat(inputY.value);
          if (isNaN(y)) throw TypeError();
          points.push(new Point(x, y));
        });
        figures.push(new Figure(...points));
      });
      model.setFigures(figures);

      model.solve().paint();
    });
  }

  class FigureBlockManager {
    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
      this.container = container;
    }

    create() {
      const div = document.createElement('div');
      div.classList.add('js-figure');

      const card = document.createElement('div');
      card.classList.add('card');
      div.appendChild(card);

      const header = document.createElement('div');
      header.classList.add('card__group');
      card.appendChild(header);

      const title = document.createElement('h2');
      title.classList.add('card__title');
      title.textContent = `Фигура №${
        document.querySelectorAll('.js-figure').length + 1
      }`;
      header.appendChild(title);

      const main = document.createElement('div');
      main.classList.add('card__group', 'js-vertices');
      card.appendChild(main);

      const manager = new VerticesBlockManager(main);
      manager.create().create().create();

      const footer = document.createElement('div');
      footer.classList.add('card__group', 'd-flex', 'child-spacing-15');
      card.appendChild(footer);

      const add = document.createElement('button');
      add.classList.add('button');
      add.type = 'button';
      add.textContent = '+';
      add.addEventListener('click', () => {
        manager.create();
      });
      footer.appendChild(add);

      const remove = document.createElement('button');
      remove.classList.add('button');
      remove.type = 'button';
      remove.textContent = '-';
      remove.addEventListener('click', () => {
        manager.delete();
      });
      footer.appendChild(remove);

      this.container.appendChild(div);

      return this;
    }

    delete() {
      const element = this.container.querySelector('.js-figure:last-child');
      if (!element) return this;
      this.container.removeChild(element);
      return this;
    }
  }

  class VerticesBlockManager {
    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
      this.container = container;
    }

    create() {
      const vertex = document.createElement('div');
      vertex.classList.add(
        'card__group',
        'd-flex',
        'child-spacing-15',
        'js-vertex',
      );

      const inputX = document.createElement('input');
      inputX.classList.add('input', 'form-figure__x');
      inputX.type = 'number';
      inputX.min = '0';
      inputX.max = '100';
      inputX.value = '50';
      vertex.appendChild(inputX);

      const inputY = document.createElement('input');
      inputY.classList.add('input', 'form-figure__y');
      inputY.type = 'number';
      inputY.min = '0';
      inputY.max = '100';
      inputY.value = '50';
      vertex.appendChild(inputY);

      this.container.appendChild(vertex);

      return this;
    }

    delete() {
      const children = this.container.querySelectorAll('.js-vertex');
      if (children.length < 4) return this;
      this.container.removeChild(children[children.length - 1]);
      return this;
    }
  }

  class ProblemModel {
    /**
     * @param {Painter} painter
     * @param {Point} pointA
     * @param {Point} pointB
     * @param {Figure[]} figures
     */
    constructor(painter, pointA, pointB, figures) {
      this.painter = painter;
      this.pointA = pointA;
      this.pointB = pointB;
      this.figures = figures;
      this.lines = null;
      this.path = null;
    }

    /**
     * @param {Point} point
     */
    setPointA(point) {
      this.pointA = point;
      return this;
    }

    /**
     * @param {Point} point
     */
    setPointB(point) {
      this.pointB = point;
      return this;
    }

    /**
     * @param {Figure[]} figures
     */
    setFigures(figures) {
      this.figures = figures;
      return this;
    }

    solve() {
      const vertices = [
        GraphVertex.from(this.pointA),
        GraphVertex.from(this.pointB),
        ...this.figures.flatMap(f => f.vertex).map(p => GraphVertex.from(p)),
      ];

      // Find all possible pairs without intersection
      const lines = [];
      for (let i = 0; i < vertices.length - 1; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
          const line = new Line(vertices[i], vertices[j]);
          const straight = new Straight(vertices[i], vertices[j]);
          let isPossible = true;
          for (let k = 0; k < this.figures.length; k++) {
            if (
              this.figures[k].isIntersectStraight(straight) &&
              this.figures[k].isIntersectLine(line)
            ) {
              isPossible = false;
              break;
            }
          }
          if (isPossible) {
            vertices[i].addEdge(vertices[j], vertices[i].distance(vertices[j]));
            lines.push(line);
          }
        }
      }

      /**
       * @TODO FAST FIX TO BUG WHEN POINT INSIDE FIGURE
       */
      if (vertices[0].edges.size === 0 || vertices[1].edges.size === 0) {
        this.lines = lines;
        this.path = null;
        return this;
      }

      const graph = new Graph(...vertices);
      const path = graph.path(0, 1);

      // Save results
      this.lines = lines;
      this.path = path;

      return this;
    }

    paint() {
      this.painter.clear();

      this.painter.resize();

      // Axis
      this.painter
        .styles({
          lineWidth: 3,
          strokeStyle: 'black',
          fillStyle: 'black',
          fontSize: '16px',
        })
        .axis()
        .stroke();

      // Figures
      this.painter.styles({
        lineWidth: 3,
        fillStyle: '#b8f2e6',
        strokeStyle: '#03045e',
      });
      this.figures.forEach(f => this.painter.figure(f).stroke().fill());

      // Grid
      this.painter
        .styles({ lineWidth: 1, strokeStyle: 'black', lineDash: [1, 3] })
        .grid()
        .stroke();

      // Lines
      if (this.lines) {
        this.painter.styles({
          lineDash: [],
          lineWidth: 2,
          strokeStyle: '#588b8b',
        });
        this.lines.forEach(l => this.painter.line(l).stroke());
      }

      // Path
      if (this.path) {
        this.painter
          .styles({ lineDash: [], lineWidth: 4, strokeStyle: 'red' })
          .path(this.path)
          .stroke();
      }

      // Points
      this.painter.styles({
        lineWidth: 1,
        fontSize: '24px',
        fillStyle: 'red',
        strokeStyle: 'red',
      });
      this.painter.point(this.pointA, 'A').stroke().fill();
      this.painter.point(this.pointB, 'B').stroke().fill();
    }
  }

  class Painter {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {{
     *  canvasWidth?: number;
     *  canvasHeight?: number;
     *  gridWidth?: number;
     *  gridHeight?: number;
     *  pointRadius?: number;
     *  marginLeft?: number;
     *  marginBottom?: number;
     * }} opts `pointRadius` isn't scaled
     */
    constructor(canvas, opts = {}) {
      this.canvas = canvas;
      this.canvas.width = opts.canvasWidth ?? window.innerWidth - 90;
      this.canvas.height = opts.canvasHeight ?? 500;
      this.context = this.canvas.getContext('2d');
      this.scaleX = 10;
      this.scaleY = 10;
      this.gridWidth = opts.gridWidth ?? 5;
      this.gridHeight = opts.gridHeight ?? 5;
      this.pointRadius = opts.pointRadius ?? 5;
      this.marginLeft = opts.marginLeft ?? 6;
      this.marginBottom = opts.marginBottom ?? 6;
    }

    resize() {
      this.canvas.width = window.innerWidth - 90;
      return this;
    }

    clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return this;
    }

    stroke() {
      this.context.stroke();
      return this;
    }

    fill() {
      this.context.fill();
      return this;
    }

    /**
     * @param {Point} point
     * @param {string?} label
     */
    point(point, label) {
      point = this.inverseYPoint(this.scalePoint(this.applyMarginPoint(point)));
      this.context.beginPath();
      this.context.moveTo(point.x + this.pointRadius, point.y);
      this.context.arc(point.x, point.y, this.pointRadius, 0, 2 * Math.PI);
      this.context.closePath();
      if (label) {
        this.context.fillText(
          label,
          point.x + this.pointRadius,
          point.y - this.pointRadius,
        );
      }
      return this;
    }

    /**
     * @param {Line} line
     */
    line(line) {
      line = this.inverseYLine(this.scaleLine(this.applyMarginLine(line)));
      this.context.beginPath();
      this.context.moveTo(line.p1.x, line.p1.y);
      this.context.lineTo(line.p2.x, line.p2.y);
      this.context.closePath();
      return this;
    }

    /**
     * @param {Path} path
     */
    path(path) {
      path = this.inverseYPath(this.scalePath(this.applyMarginPath(path)));
      this.context.beginPath();
      this.context.closePath();
      this.context.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        this.context.lineTo(path.points[i].x, path.points[i].y);
      }
      return this;
    }

    /**
     * @param {Figure} figure
     */
    figure(figure) {
      figure = this.inverseYFigure(
        this.scaleFigure(this.applyMarginFigure(figure)),
      );
      this.context.beginPath();
      this.context.moveTo(figure.vertex[0].x, figure.vertex[0].y);
      for (let i = 1; i < figure.vertex.length; i++) {
        this.context.lineTo(figure.vertex[i].x, figure.vertex[i].y);
      }
      this.context.closePath();
      return this;
    }

    axis() {
      this.context.beginPath();

      // X axis
      const y = this.canvas.height - this.marginBottom * this.scaleY;
      this.context.moveTo(0, y);
      this.context.lineTo(this.canvas.width, y);

      // Y axis
      const x = this.marginLeft * this.scaleX;
      this.context.moveTo(x, 0);
      this.context.lineTo(x, this.canvas.height);

      // 0
      this.context.fillText('0', x + this.pointRadius, y - this.pointRadius);

      // X axis labels
      for (
        let i = this.gridVerticalXBegin();
        i < this.gridVerticalXEnd();
        i += this.gridWidth
      ) {
        if (i === 0) continue;
        const tempX = i * this.scaleX + this.marginLeft * this.scaleX;
        this.context.moveTo(tempX, y - this.pointRadius);
        this.context.lineTo(tempX, y + this.pointRadius);
        this.context.fillText(i.toString(), tempX, y - this.pointRadius);
      }

      // Y axis labels
      for (
        let i = this.gridHorizontalYBegin();
        i < this.gridHorizontalYEnd();
        i += this.gridHeight
      ) {
        if (i === 0) continue;
        const tempY =
          this.canvas.height -
          i * this.scaleY -
          this.marginBottom * this.scaleY;
        this.context.moveTo(x - this.pointRadius, tempY);
        this.context.lineTo(x + this.pointRadius, tempY);
        this.context.fillText(
          i.toString(),
          x + this.pointRadius,
          tempY - this.pointRadius,
        );
      }

      this.context.closePath();
      return this;
    }

    grid() {
      this.context.beginPath();

      // Vertical Lines
      for (
        let i = this.gridVerticalXBegin();
        i < this.gridVerticalXEnd();
        i += this.gridWidth
      ) {
        const tempX = i * this.scaleX + this.marginLeft * this.scaleX;
        this.context.moveTo(tempX, 0);
        this.context.lineTo(tempX, this.canvas.height);
      }

      // Horizontal Lines
      for (
        let i = this.gridHorizontalYBegin();
        i < this.gridHorizontalYEnd();
        i += this.gridHeight
      ) {
        const tempY =
          this.canvas.height -
          i * this.scaleY -
          this.marginBottom * this.scaleY;
        this.context.moveTo(0, tempY);
        this.context.lineTo(this.canvas.width, tempY);
      }

      this.context.closePath();
      return this;
    }

    /**
     * @private
     */
    gridVerticalXBegin() {
      return -this.marginLeft + 1 + ((this.marginLeft - 1) % this.gridWidth);
    }

    /**
     * @private
     */
    gridVerticalXEnd() {
      return this.canvas.width / this.scaleX - this.marginLeft;
    }

    /**
     * @private
     */
    gridHorizontalYBegin() {
      return (
        -this.marginBottom + 1 + ((this.marginBottom - 1) % this.gridHeight)
      );
    }

    /**
     * @private
     */
    gridHorizontalYEnd() {
      return this.canvas.height / this.scaleY - this.marginBottom;
    }

    /**
     * @param {{
     *  lineWidth?: number;
     *  strokeStyle?: string;
     *  fillStyle?: string;
     *  lineDash?: number[];
     *  fontSize?: string;
     * }} styles
     */
    styles({ lineWidth, strokeStyle, fillStyle, lineDash, fontSize }) {
      if (lineWidth) this.context.lineWidth = lineWidth;
      if (strokeStyle) this.context.strokeStyle = strokeStyle;
      if (fillStyle) this.context.fillStyle = fillStyle;
      if (lineDash) this.context.setLineDash(lineDash);
      if (fontSize) {
        this.context.font = this.context.font.replace(/^\S+/, fontSize);
      }
      return this;
    }

    /**
     * @param {Point} point
     * @private
     */
    scalePoint(point) {
      return new Point(point.x * this.scaleX, point.y * this.scaleY);
    }

    /**
     * @param {Line} line
     * @private
     */
    scaleLine(line) {
      return new Line(this.scalePoint(line.p1), this.scalePoint(line.p2));
    }

    /**
     * @param {Path} path
     * @private
     */
    scalePath(path) {
      return new Path(...path.points.map(p => this.scalePoint(p)));
    }

    /**
     * @param {Figure} figure
     * @private
     */
    scaleFigure(figure) {
      return new Figure(...figure.vertex.map(v => this.scalePoint(v)));
    }

    /**
     * @param {Point} point
     * @private
     */
    inverseYPoint(point) {
      return new Point(point.x, 500 - point.y);
    }

    /**
     * @param {Line} line
     * @private
     */
    inverseYLine(line) {
      return new Line(this.inverseYPoint(line.p1), this.inverseYPoint(line.p2));
    }

    /**
     * @param {Path} path
     * @private
     */
    inverseYPath(path) {
      return new Path(...path.points.map(p => this.inverseYPoint(p)));
    }

    /**
     * @param {Figure} figure
     * @private
     */
    inverseYFigure(figure) {
      return new Figure(...figure.vertex.map(v => this.inverseYPoint(v)));
    }

    /**
     * @param {Point} point
     * @private
     */
    applyMarginPoint(point) {
      return new Point(point.x + this.marginLeft, point.y + this.marginBottom);
    }

    /**
     * @param {Line} line
     * @private
     */
    applyMarginLine(line) {
      return new Line(
        this.applyMarginPoint(line.p1),
        this.applyMarginPoint(line.p2),
      );
    }

    /**
     * @param {Path} path
     * @private
     */
    applyMarginPath(path) {
      return new Path(...path.points.map(p => this.applyMarginPoint(p)));
    }

    /**
     * @param {Figure} figure
     * @private
     */
    applyMarginFigure(figure) {
      return new Figure(...figure.vertex.map(v => this.applyMarginPoint(v)));
    }
  }

  const Sign = Object.freeze({ UNKNOWN: 0, NEGATIVE: 1, POSITIVE: 2 });

  class Point {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    /**
     * @param {Point} point
     */
    distance(point) {
      return Math.sqrt(
        Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2),
      );
    }
  }

  class Line {
    /**
     * @param {Point} p1
     * @param {Point} p2
     */
    constructor(p1, p2) {
      this.p1 = p1;
      this.p2 = p2;
    }
  }

  class Path {
    /**
     * @param  {...Point} points
     */
    constructor(...points) {
      this.points = points;
    }
  }

  class Straight {
    /**
     * @param {Point} p1
     * @param {Point} p2
     */
    constructor(p1, p2) {
      this.a = p2.y - p1.y;
      this.b = p1.x - p2.x;
      this.c = p1.x * (p1.y - p2.y) + p1.y * (p2.x - p1.x);
    }

    /**
     * @param {Point} p
     */
    value(p) {
      return this.a * p.x + this.b * p.y + this.c;
    }
  }

  class Figure {
    /**
     * @param  {...Point} vals
     */
    constructor(...vals) {
      this.vertex = vals;
      this.straights = [];

      for (let i = 0; i < this.vertex.length; i++) {
        this.straights.push(
          new Straight(
            this.vertex[i],
            this.vertex[i + 1 !== this.vertex.length ? i + 1 : 0],
          ),
        );
      }
    }

    /**
     * @param {Straight} straight
     */
    isIntersectStraight(straight) {
      let sign = Sign.UNKNOWN;
      let index = -1;
      while (++index < this.vertex.length) {
        const value = straight.value(this.vertex[index]);
        switch (sign) {
          case Sign.UNKNOWN:
            if (value < 0) {
              sign = Sign.NEGATIVE;
            } else if (value > 0) {
              sign = Sign.POSITIVE;
            }
            break;
          case Sign.NEGATIVE:
            if (value > 0) {
              return true;
            }
            break;
          case Sign.POSITIVE:
            if (value < 0) {
              return true;
            }
            break;
        }
      }
      return false;
    }

    /**
     * @param {Line} line
     */
    isIntersectLine(line) {
      let sign = Sign.UNKNOWN;
      let index = -1;
      while (++index < this.straights.length) {
        const value1 = this.straights[index].value(line.p1);
        const value2 = this.straights[index].value(line.p2);
        /**
         * @TODO FIX NUMBER OF COMPARISONS
         */
        if ((value1 > 0 && value2 < 0) || (value1 < 0 && value2 > 0)) {
          continue;
        }
        switch (sign) {
          case Sign.UNKNOWN:
            /**
             * @TODO FIX WHEN line.p1 === line.p2 === figure.vertex[index]
             */
            if (value1 <= 0 && value2 <= 0) {
              sign = Sign.NEGATIVE;
            } else if (value1 >= 0 && value2 >= 0) {
              sign = Sign.POSITIVE;
            }
            break;
          case Sign.NEGATIVE:
            /**
             * @TODO FIX WHEN line.p1 === line.p2 === figure.vertex[index]
             */
            if (value1 >= 0 && value2 >= 0) {
              return false;
            }
            break;
          case Sign.POSITIVE:
            /**
             * @TODO FIX WHEN line.p1 === line.p2 === figure.vertex[index]
             */
            if (value1 <= 0 && value2 <= 0) {
              return false;
            }
            break;
        }
      }
      return true;
    }
  }

  class GraphVertex extends Point {
    /**
     * @type {Map<GraphVertex, number>}
     */
    edges;

    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
      super(x, y);
      this.edges = new Map();
    }

    /**
     * @param {Point} point
     */
    static from(point) {
      return new this(point.x, point.y);
    }

    /**
     * @param {GraphVertex} vertex
     * @param {number} weight
     */
    addEdge(vertex, weight) {
      this.edges.set(vertex, weight);
      vertex.edges.set(this, weight);
      return this;
    }
  }

  class Graph {
    /**
     * @param  {...GraphVertex} vertices
     */
    constructor(...vertices) {
      this.vertices = vertices;

      // Creates a vertex-based adjacency matrix.
      // @TODO Implement algo without adjacency matrix, but with HashTables.
      this.matrix = Array(this.vertices.length)
        .fill(null)
        .map(() => Array(this.vertices.length).fill(0));
      for (let i = 0; i < this.vertices.length; i++) {
        for (let j = 0; j < this.vertices.length; j++) {
          if (this.vertices[i].edges.has(this.vertices[j])) {
            this.matrix[i][j] = this.vertices[i].edges.get(this.vertices[j]);
          }
        }
      }
    }

    /**
     * Uses Dijkstra algorithm.
     * @param {number} source
     * @param {number} sink
     */
    path(source, sink) {
      const size = this.vertices.length;
      const path = Array(size).fill(null);
      const visited = Array(size).fill(false);
      const weights = Array(size).fill(Number.MAX_VALUE);
      weights[source] = 0;

      let current = source;
      while (true) {
        visited[current] = true;

        // Update weights for an adjacent vertex with the current one.
        for (let i = 0; i < size; i++) {
          if (!this.matrix[current][i]) continue;
          const weight = weights[current] + this.matrix[current][i];
          if (weight < weights[i]) {
            weights[i] = weight;
            path[i] = current;
          }
        }

        // Find an unvisited vertex with minimum weight.
        let next;
        for (let i = 0; i < size; i++) {
          if (visited[i]) continue;
          if (!next || weights[next] > weights[i]) {
            next = i;
          }
        }
        if (!next) break;
        current = next;
      }

      return this.decodePath(path, source, sink);
    }

    /**
     * @param {number[]} path
     * @param {number} source
     * @param {number} sink
     * @private
     */
    decodePath(path, source, sink) {
      /**
       * @TODO HANDLE ERROR FOR CLIENT
       */
      if (path[sink] === undefined) throw Error('CANNOT_FIND_PATH');

      const result = [this.vertices[sink]];

      while (true) {
        result.push(this.vertices[path[sink]]);
        if (path[sink] === source) break;
        sink = path[sink];
      }

      return new Path(...result.reverse());
    }
  }

  //////////////////////////////////////////////////////////////////////////////

  main();
})();
