import { render } from '@chialab/dna';
import React from 'react';
import type { PartialStoryFn } from 'storybook/internal/types';
import type { DnaRenderer } from '../types';

export const prepareForInline = (storyFn: PartialStoryFn<DnaRenderer>) => {
    class Story extends React.Component {
        wrapperRef = React.createRef();

        componentDidMount() {
            render(storyFn(), this.wrapperRef.current as Element);
        }

        render() {
            return React.createElement('div', {
                ref: this.wrapperRef,
            });
        }
    }

    return React.createElement(Story);
};
