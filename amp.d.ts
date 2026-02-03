// AMP custom element type declarations
declare namespace JSX {
  interface IntrinsicElements {
    'amp-accordion': AmpAccordionProps;
    'amp-list': AmpListProps;
    'amp-next-page': AmpNextPageProps;
    'amp-form': AmpFormProps;
    'amp-bind': AmpBindProps;
  }

  interface AmpAccordionProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
    animate?: boolean | string;
  }

  interface AmpListProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
    width?: string | number;
    height?: string | number;
    layout?: string;
    src?: string;
    'reset-on-refresh'?: boolean | string;
    'single-item'?: boolean | string;
  }

  interface AmpNextPageProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
    src?: string;
    width?: string | number;
    height?: string | number;
    layout?: string;
  }

  interface AmpFormProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
    method?: string;
    action?: string;
    'custom-validation-reporting'?: string;
    on?: string;
  }

  interface AmpBindProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  }
}
