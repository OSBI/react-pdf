/**
 *   Copyright 2017 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, { Component, PropTypes } from 'react';

if (typeof window !== 'undefined') {
  require('pdfjs-dist/build/pdf.combined');
  require('pdfjs-dist/web/compatibility');
}

class SaikuPDF extends Component {
  constructor(props) {
    super(props);
    this.onDocumentComplete = this.onDocumentComplete.bind(this);
    this.onDocumentError = this.onDocumentError.bind(this);
    this.onPageComplete = this.onPageComplete.bind(this);
    this.onPageError = this.onPageError.bind(this);
  }

  static propTypes = {
    content: PropTypes.string,
    file: PropTypes.string,
    error: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node
    ]),
    loading: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node
    ]),
    noData: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node
    ]),
    page: PropTypes.number,
    scale: PropTypes.number,
    width: PropTypes.number,
    rotate: PropTypes.number,
    onDocumentComplete: PropTypes.func,
    onDocumentError: PropTypes.func,
    onPageComplete: PropTypes.func,
    onPageError: PropTypes.func,
    style: PropTypes.object
  };

  static defaultProps = {
    page: 1,
    scale: 1.0,
    error: 'Failed to load PDF file.',
    loading: 'Loading PDF...',
    noData: 'No PDF file specified.'
  };

  state = {
    pdf: null,
    page: null
  };

  componentDidMount() {
    this.loadPDFDocument(this.props);
    this.renderPdf();
  }

  componentWillReceiveProps(nextProps) {
    const { pdf } = this.state;

    if ((nextProps.file && nextProps.file !== this.props.file) ||
      (nextProps.content && nextProps.content !== this.props.content)) {
      this.loadPDFDocument(nextProps);
    }

    if (pdf && (((nextProps.page && nextProps.page !== this.props.page) ||
      (nextProps.scale && nextProps.scale !== this.props.scale)) ||
      (nextProps.rotate && nextProps.rotate !== this.props.rotate))) {
      this.setState({ page: null });
      pdf.getPage(nextProps.page)
        .then(this.onPageComplete)
        .catch(this.onPageError);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextState.pdf !== this.state.pdf ||
      nextState.page !== this.state.page ||
      nextProps.scale !== this.props.scale ||
      nextProps.width !== this.props.width ||
      nextProps.rotate !== this.props.rotate
    );
  }

  onDocumentComplete(pdf) {
    this.setState({ pdf });

    const { onDocumentComplete } = this.props;
    const numPages = pdf.numPages;

    if (typeof onDocumentComplete === 'function') {
      onDocumentComplete(numPages, pdf);
    }

    pdf.getPage(this.props.page)
      .then(this.onPageComplete)
      .catch(this.onPageError);
  }

  onDocumentError(error) {
    this.setState({ pdf: false });

    const { onDocumentError } = this.props;

    if (typeof onDocumentError === 'function') {
      onDocumentError(error);
    }
  }

  onPageComplete(page) {
    this.setState({ page });
    this.renderPdf();

    const { onPageComplete } = this.props;
    const pageIndex = page.pageIndex + 1;

    if (typeof onPageComplete === 'function') {
      onPageComplete(pageIndex, page);
    }
  }

  onPageError(error) {
    this.setState({ pdf: false });

    const { onPageError } = this.props;

    if (typeof onPageError === 'function') {
      onPageError(error);
    }
  }

  getPageScale(page = this.state.page) {
    const { scale, width } = this.props;

    // be default, we'll render page at 100% * scale width.
    let pageScale = 1;

    // if width is defined, calculate the scale of the page
    // so it could be of desired width.
    if (width) {
      pageScale = width / page.getViewport(scale).width;
    }

    return scale * pageScale;
  }

  loadByteArray(byteArray) {
    window.PDFJS.getDocument(byteArray)
      .then(this.onDocumentComplete)
      .catch(this.onDocumentError);
  }

  loadPDFDocument(props) {
    const hasFile = !!props.file;
    const hasContent = !!props.content;

    if (hasFile) {
      if (typeof props.file === 'string') {
        return window.PDFJS.getDocument(props.file)
          .then(this.onDocumentComplete);
      }

      // is a File object
      const reader = new FileReader();

      reader.onloadend = () => {
        this.loadByteArray(new Uint8Array(reader.result));
      }

      reader.readAsArrayBuffer(props.file);
    }
    else if (hasContent) {
      const bytes = window.atob(props.content);
      const byteLength = bytes.length;
      const byteArray = new Uint8Array(new ArrayBuffer(byteLength));

      for (let i = 0; i < byteLength; i++) {
        byteArray[i] = bytes.charCodeAt(i);
      }

      this.loadByteArray(byteArray);
    }
    else {
      throw new Error('Saiku PDFjs works with a file (URL) or content ' +
        '(base64). At least one needs to be provided!');
    }
  }

  renderNoData() {
    return (
      <div>{this.props.noData}</div>
    );
  }

  renderError() {
    return (
      <div>{this.props.error}</div>
    );
  }

  renderLoader() {
    return (
      <div>{this.props.loading}</div>
    );
  }

  renderPdf() {
    const { page } = this.state;

    if (page) {
      let { canvas } = this.refs;

      // compatible with react 0.13
      if (canvas.getDOMNode) {
        canvas = canvas.getDOMNode();
      }

      const pixelRatio = window.devicePixelRatio || 1;
      const canvasContext = canvas.getContext('2d');
      const pageScale = this.getPageScale() * pixelRatio;
      const { rotate } = this.props;
      const viewport = page.getViewport(pageScale, rotate);

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.height = `${viewport.height / pixelRatio}px`;
      canvas.style.width = `${viewport.width / pixelRatio}px`;
      page.render({ canvasContext, viewport });
    }
  }

  render() {
    const { file, style } = this.props;
    const { pdf, page } = this.state;

    if (!file) {
      return this.renderNoData();
    }

    if (pdf === false || page === false) {
      return this.renderError();
    }

    if (pdf === null || page === null) {
      return this.renderLoader();
    }

    return (
      <canvas style={style} ref="canvas" />
    );
  }
}

export default SaikuPDF;
