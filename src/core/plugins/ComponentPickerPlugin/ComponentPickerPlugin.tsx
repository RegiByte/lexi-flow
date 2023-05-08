import {
  LexicalTypeaheadMenuPlugin,
  TypeaheadOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import React, { useCallback, useMemo } from "react";
import classNames from "classnames";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getSelection, $isRangeSelection, INSERT_PARAGRAPH_COMMAND, TextNode } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, HeadingTagType } from "@lexical/rich-text";
import ReactDOM from "react-dom/client";
import { createPortal } from "react-dom";
import { BiHeading, BiParagraph } from "react-icons/all";

class ComponentPickerOption extends TypeaheadOption {
  // What shows up in the editor
  title: string;
  // Icon for display
  icon?: JSX.Element;
  // Extra keywords for searching
  keywords: string[];
  // TBD
  keyboardShortcut?: string;
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: JSX.Element;
      keywords?: string[];
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    },
  ) {
    super(title);
    this.title = title;
    this.icon = options.icon;
    this.keywords = options.keywords ?? [];
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }

  static make(
    title: string,
    options: {
      icon?: JSX.Element;
      keywords?: string[];
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    },
  ): ComponentPickerOption {
    return new ComponentPickerOption(title, options);
  }
}

const ComponentPickerMenuItem: React.FC<{
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: ComponentPickerOption;
}> = ({ index, isSelected, onClick, onMouseEnter, option }) => {
  const className = classNames(
    "item m-0 min-w-[180px] font-large outline-none cursor-pointer rounded aria-selected:bg-slate-100",
    "flex items-center leading-[16px] gap-2 cursor-pointer shrink-0 border-none p-2",
    {
      selected: isSelected,
    },
  );

  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={`typeahead-option-${index}`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}>
      {option.icon}
      <span className="text">{option.title}</span>
    </li>
  );
};

export default function ComponentPickerMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = React.useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
    maxLength: 2,
  });

  const options = useMemo(() => {
    return [
      ComponentPickerOption.make("Paragraph", {
        icon: <BiParagraph />,
        keyboardShortcut: "⌘+⇧+T",
        keywords: [],
        onSelect: (queryString: string) => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
          });
        },
      }),
      ...[1, 2, 3, 4, 5, 6].map((i) =>
        ComponentPickerOption.make(`Heading ${i}`, {
          icon: <BiHeading />,
          keyboardShortcut: "⌘+⇧+T",
          keywords: [],
          onSelect: (queryString: string) => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const tagType = `h${i}` as HeadingTagType;
              $setBlocksType(selection, () => $createHeadingNode(tagType));
            }
          },
        }),
      ),
    ];
  }, []);

  const filteredOptions = useMemo(() => {
    if (!queryString || !queryString.trim()) {
      return options;
    }

    return options.filter((option) => {
      const regexp = new RegExp(queryString, "gi");
      const matchTitle = regexp.exec(option.title);
      const matchKeywords = option.keywords.some((keyword) => regexp.exec(keyword));

      return matchTitle || matchKeywords;
    });
  }, [options, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        if (nodeToRemove) {
          nodeToRemove.remove();
        }
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [],
  );

  return (
    <>
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        options={filteredOptions}
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
          return anchorElementRef.current && options.length
            ? createPortal(
                <div
                  className="typehead-popover component-picker-menu
                rounded mt-8
                relative bg-white shadow-md min-w-[200px]">
                  <ul className="p-0 list-none m-0 max-h-[200px] scrollbar-hidden overflow-y-scroll">
                    {options.map((option, index) => (
                      <ComponentPickerMenuItem
                        index={index}
                        isSelected={selectedIndex === index}
                        onClick={() => {
                          setHighlightedIndex(index);
                          selectOptionAndCleanUp(option);
                        }}
                        onMouseEnter={() => {
                          setHighlightedIndex(index);
                        }}
                        option={option}
                      />
                    ))}
                  </ul>
                </div>,
                anchorElementRef.current,
              )
            : null;
        }}
      />
    </>
  );
}
