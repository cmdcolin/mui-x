import * as React from 'react';
import { ChartItemIdentifier, ChartSeriesType } from '../models/seriesType/config';

export interface HighlightProviderProps {
  children: React.ReactNode;
}

export type ItemHighlightData<T extends ChartSeriesType> = ChartItemIdentifier<T>;

export type HighlightOptions = 'none' | 'item' | 'series';
export type FadeOptions = 'none' | 'series' | 'global';

export type HighlightScope = {
  /**
   * The scope of highlighted elements.
   * - 'none': no highlight.
   * - 'item': only highlight the item.
   * - 'series': highlight all elements of the same series.
   * @default 'none'
   */
  highlighted: HighlightOptions;
  /**
   * The scope of faded elements.
   * - 'none': no fading.
   * - 'series': only fade element of the same series.
   * - 'global': fade all elements that are not highlighted.
   * @default 'none'
   */
  faded: FadeOptions;
};
type HighlightActions<T extends ChartSeriesType = ChartSeriesType> =
  | {
      type: 'enterItem';
      item: ItemHighlightData<T>;
      scope?: Partial<HighlightScope>;
    }
  | {
      type: 'leaveItem';
      item: ItemHighlightData<T>;
    };

type HighlightState = {
  /**
   * The item that triggers the highlight state.
   */
  item: null | ItemHighlightData<ChartSeriesType>;
  scope: HighlightScope;
  dispatch: React.Dispatch<HighlightActions>;
};

const defaultScope: HighlightScope = { highlighted: 'none', faded: 'none' };

export const HighlightContext = React.createContext<HighlightState>({
  item: null,
  scope: defaultScope,
  dispatch: () => null,
});

if (process.env.NODE_ENV !== 'production') {
  HighlightContext.displayName = 'HighlightContext';
}

const dataReducer: React.Reducer<Omit<HighlightState, 'dispatch'>, HighlightActions> = (
  prevState,
  action,
) => {
  switch (action.type) {
    case 'enterItem':
      return {
        ...prevState,
        item: action.item,
        scope: { ...defaultScope, ...action.scope },
      };

    case 'leaveItem':
      if (
        prevState.item === null ||
        (Object.keys(action.item) as (keyof ItemHighlightData<ChartSeriesType>)[]).some(
          (key) => action.item[key] !== prevState.item![key],
        )
      ) {
        // The item is already something else
        return prevState;
      }
      return { ...prevState, item: null };

    default:
      return prevState;
  }
};

function HighlightProvider(props: HighlightProviderProps) {
  const { children } = props;
  const [data, dispatch] = React.useReducer(dataReducer, {
    item: null,
    scope: defaultScope,
  });

  const value = React.useMemo(
    () => ({
      ...data,
      dispatch,
    }),
    [data],
  );

  return <HighlightContext.Provider value={value}>{children}</HighlightContext.Provider>;
}

export { HighlightProvider };
