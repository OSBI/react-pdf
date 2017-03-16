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

import { storiesOf } from '@kadira/storybook';
import React from 'react';
import SaikuPDF from './index';

const PDF_FILE = 'http://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

storiesOf('Saiku React PDF.js', module)
  .add('Render PDF file', () => (
    <SaikuPDF
      file={PDF_FILE}
    />
  ))

  .add('Selecting the page two', () => (
    <SaikuPDF
      file={PDF_FILE}
      page={2}
    />
  ))

  .add('Rotate the page 90 degrees', () => (
    <SaikuPDF
      file={PDF_FILE}
      rotate={90}
    />
  ))
