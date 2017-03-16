# Saiku React PDF.js

> A React component to wrap [PDF.js](https://github.com/mozilla/pdf.js).

## Installation

**Using NPM:**

```console
npm install --save saiku-react-pdfjs
```

**Using Yarn:**

```console
yarn add saiku-react-pdfjs
```

## Usage

Here's an example of basic usage:

```js
import React, { Component } from 'react';
import SaikuPDF from 'saiku-react-pdfjs';

class MyApp extends Component {
  constructor(props) {
    super(props);

    this.onDocumentComplete = this.onDocumentComplete.bind(this);
    this.onPageComplete = this.onPageComplete.bind(this);
  }

  onDocumentComplete(numberOfPages, document) {
    this.setState({ numberOfPages });
  },

  onPageComplete(currentPage, page) {
    this.setState({ currentPage });
  }

  render() {
    return (
      <div>
        <SaikuPDF
          file="someFile.pdf"
          page={2}
          scale={1}
          onDocumentComplete={this.onDocumentComplete}
          onPageComplete={this.onPageComplete}
        />
        <p>Page {this.state.currentPage} of {this.state.numberOfPages}</p>
      </div>
    );
  }
}

export default MyApp;
```

## Contributing

If you want to help, please read the [Contributing](https://github.com/OSBI/saiku-react-pdfjs/blob/master/CONTRIBUTING.md) guide.

## History

For detailed changelog, see [Releases](https://github.com/OSBI/saiku-react-pdfjs/releases).

## License

[Apache License Version 2](https://github.com/OSBI/saiku-react-pdfjs/blob/master/LICENSE) © Meteorite BI
