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

class SaikuPdf extends Component {
  constructor(props) {
    super(props);
    this.onDocumentComplete = this.onDocumentComplete.bind(this);
    this.onPageComplete = this.onPageComplete.bind(this);
  }

  static propTypes = {
    content: PropTypes.string,
    file: PropTypes.string,
    loading: PropTypes.any,
    page: PropTypes.number,
    scale: PropTypes.number,
    rotate: PropTypes.number,
    onDocumentComplete: PropTypes.func,
    onPageComplete: PropTypes.func,
    style: PropTypes.object
  };

  static defaultProps = {
    page: 1,
    scale: 1.0,
    loading: <div>Loading PDF...</div>
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
      pdf.getPage(nextProps.page).then(this.onPageComplete);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextState.pdf !== this.state.pdf ||
      nextState.page !== this.state.page ||
      nextProps.width !== this.props.width ||
      nextProps.scale !== this.props.scale
    );
  }

  onDocumentComplete(pdf) {
    this.setState({ pdf });

    const { onDocumentComplete } = this.props;

    if (typeof onDocumentComplete === 'function') {
      onDocumentComplete(pdf);
    }

    pdf.getPage(this.props.page).then(this.onPageComplete);
  }

  onPageComplete(page) {
    this.setState({ page });
    this.renderPdf();

    const { onPageComplete } = this.props;

    if (typeof onPageComplete === 'function') {
      onPageComplete(page.pageIndex + 1);
    }
  }

  loadByteArray(byteArray) {
    window.PDFJS.getDocument(byteArray).then(this.onDocumentComplete);
  }

  loadPDFDocument(props) {
    const hasFile = !!props.file;
    const hasContent = !!props.file;

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

  renderPdf() {
    const { page } = this.state;

    if (page) {
      let { canvas } = this.refs;

      // compatible with react 0.13
      if (canvas.getDOMNode) {
        canvas = canvas.getDOMNode();
      }

      const canvasContext = canvas.getContext('2d');
      const { scale, rotate } = this.props;
      const viewport = page.getViewport(scale, rotate);

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      page.render({ canvasContext, viewport });
    }
  }

  render() {
    const { loading, style } = this.props;
    const { page } = this.state;

    return page
      ? <canvas style={style} ref="canvas" />
      : loading || <div>Loading PDF...</div>;
  }
}

export default SaikuPdf;
