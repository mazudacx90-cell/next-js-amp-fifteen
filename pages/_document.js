// pages/_document.js - Inject styles via getInitialProps and filter empty amp-custom tags
import Document, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';
import { ampCustomCss } from '../styles/ampStyles';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    
    // Filter out any existing amp-custom style tags (empty or with content)
    // Next.js may create an empty one, we'll replace it with our single tag
    const stylesArray = React.Children.toArray(initialProps.styles);
    const filteredStyles = stylesArray.filter((style) => {
      if (React.isValidElement(style)) {
        const props = style.props || {};
        // Remove ALL amp-custom tags - we'll add our own single one
        if (props['amp-custom'] !== undefined || props.ampCustom !== undefined) {
          return false;
        }
      }
      return true;
    });
    
    return {
      ...initialProps,
      styles: (
        <>
          {filteredStyles}
          {/* Single amp-custom style tag with all CSS */}
          <style amp-custom="" dangerouslySetInnerHTML={{ __html: ampCustomCss }} key="amp-custom-styles" />
        </>
      ),
    };
  }

  render() {
    return (
      <Html amp>
        <Head>
          <script async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js"></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
