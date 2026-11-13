import { Fragment } from 'react';
import type * as React from 'react';
import { rem } from 'polished';
import { styled } from 'styled-components';
import { home } from '../lib/url';
import { BreadcrumbDivider } from './BreadcrumbDivider';
import { mb } from './media-breakpoints';
import { theme } from './theme';

export const BreadcrumbsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${rem(8)};
  color: ${theme.colors.cyan};
  font-size: ${theme.fontSizes.small};
  font-weight: ${theme.fontWeights.heavy};
  letter-spacing: 0.25em;
  text-transform: uppercase;

  span {
    flex: 0 0 auto;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  ${mb('compact', { max: true })} {
    gap: ${rem(4)};
    font-size: ${theme.fontSizes.caption};
    letter-spacing: 0.12em;
  }
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'landscape', orientation: 'landscape' })} {
    font-size: ${theme.fontSizes.caption};
    letter-spacing: 0.12em;
  }
`;

const HomeBreadcrumbMobile = styled.span`
  display: inline-block;
  ${mb('s')} {
    display: none;
  }
`;

const HomeBreadcrumb = styled.span`
  display: none;
  ${mb('s')} {
    display: inline-block;
  }
`;

export type Breadcrumb = {
  label: string;
  link: string;
};

export type BreadcrumbsProps = {
  breadcrumbs: readonly Breadcrumb[];
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs }) => (
  <BreadcrumbsWrapper as="nav" aria-label="Game location">
    <a href={home()} aria-label="Mission Critical">
      <HomeBreadcrumbMobile>MSN CRTCL</HomeBreadcrumbMobile>
      <HomeBreadcrumb>Mission Critical</HomeBreadcrumb>
    </a>
    {breadcrumbs.map((breadcrumb, index) => (
      <Fragment key={breadcrumb.link}>
        <BreadcrumbDivider />
        {index === breadcrumbs.length - 1 ? (
          <span aria-current="page">{breadcrumb.label}</span>
        ) : (
          <a href={breadcrumb.link}>{breadcrumb.label}</a>
        )}
      </Fragment>
    ))}
  </BreadcrumbsWrapper>
);
