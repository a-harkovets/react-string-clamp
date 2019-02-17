import React, { PureComponent } from 'react';

import StrClamper from './utils';

class TextClamp extends PureComponent {
  constructor() {
    super();
    this.state = {
      clampedText: '',
      lastResizeCallTimestamp: 0,
      maxHeight: null
    };
    this.textContainer = React.createRef();
  }

  render() {
    const { styles, element, onClick } = this.props;
    const { clampedText, maxHeight } = this.state;
    const builtInStyles = {
      maxHeight,
      display: 'block',
      overflowY: 'hidden'
    };

    return React.createElement(element || typeof element !== 'string' ? element : 'div', {
      ref: this.textContainer,
      style: { ...builtInStyles, ...styles },
      onClick
    }, clampedText);
  }

  putReRenderTasksQueue = () => {
    const { lastResizeCallTimestamp, clampTextTimeout } = this.state;
    if (window.performance.now() > lastResizeCallTimestamp + 130) {
      this.setState({ clampTextTimeout: null });
      setTimeout(this.clampText, 0);
    } else if (!clampTextTimeout) {
      this.setState({
        clampTextTimeout: setTimeout(
          this.clampText, lastResizeCallTimestamp + 130 - window.performance.now()
        )
      });
    }
  }

  componentDidMount = () => {
    this.clampText();
    setInterval(this.sizeGuard, 80);
  }

  componentWillUnmount = () => {
    setInterval(this.sizeGuard, 80);
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.clampedText !== prevState.clampedText) {
      this.setState({
        maxHeight: this.textContainer.current.clientHeight
      });
    }
  }

  sizeGuard = () => {
    const { latestWidth } = this.state;
    if (latestWidth !== Math.round(this.textContainer.current.clientWidth)) {
      this.setState({
        latestWidth: Math.round(this.textContainer.current.clientWidth)
      });
      this.putReRenderTasksQueue();
    }
  }

  clampText = () => {
    if (!this || !this.textContainer.current) {
      return;
    }
    const {
      text, lines, ellipsis, splitter, punctuation, gap, reverse,
      punctuationChars, punctuaionCharsAdditional
    } = this.props;
    if (!text) {
      return;
    }

    const additionalPunctuationChars =
      punctuaionCharsAdditional && typeof punctuaionCharsAdditional === 'object'
        ? punctuaionCharsAdditional
        : [];

    const clampedText = StrClamper.clampLines(text, this.textContainer.current, {
      ellipsis, splitter, punctuation, reverse,
      gap:
        Number(gap) >= 0 ? Number(gap) : 0.01,
      punctuationChars:
        [...punctuationChars, ...additionalPunctuationChars],
      lines:
        Math.floor(Number(lines)) ? Math.floor(Number(lines)) : 1
    });
    this.setState({
      clampedText,
      lastResizeCallTimestamp: window.performance.now()
    });
  }
}

TextClamp.defaultProps = {
  styles: {},
  lines: 1,
  ellipsis: '...',
  punctuation: true,
  reverse: false,
  gap: 0.01,
  splitter: ' ',
  element: 'div',
  punctuationChars: [
    ',', '/', '\\', '&', '.', '-', '!', '?', ' ', ';', ':',
    String.fromCharCode(13), String.fromCharCode(10), String.fromCharCode(9)
  ],
  punctuaionCharsAdditional: [],
  onClick: () => null
};

let PropTypes;
try {
  PropTypes = require('prop-types');
  TextClamp.propTypes = {
    text: PropTypes.string.isRequired,
    styles: PropTypes.object,
    lines: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ellipsis: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    splitter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    punctuation: PropTypes.bool,
    reverse: PropTypes.bool,
    gap: PropTypes.number,
    element: PropTypes.string,
    punctuationChars: PropTypes.array,
    punctuaionCharsAdditional: PropTypes.array,
    onClick: PropTypes.func
  };
} catch (err) {
}

export default TextClamp;
