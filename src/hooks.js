import React, { useEffect, useLayoutEffect, useState } from 'react';

export function useIntrinsicWidth(ref) {
  const [width, setWidth] = useState('auto');

  useEffect(() => {
    const { width, height } = ref.current.getBoundingClientRect();

    if (height < 24) {
      // Not multi-line
      return;
    }

    setWidth(`${width}px`);
  }, [ref.current]);

  return width;
}

export function useLockBodyScroll() {
  useLayoutEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = originalStyle);
  }, []);
}

export function useChatHistory(graph) {
  const startNode = graph.nodes[graph.startId];
  const [chatHistory, setChatHistory] = useState(startNode.messages.map(message => ({ markup: message })));

  function addMessages(messages) {
    setChatHistory(chatHistory.concat(messages));
  }

  return [chatHistory, addMessages];
}

function getNextActions(node, graph) {
  return node.next.reduce((memo, id) => memo.concat([{ id, action: graph.nodes[id].action }]), []);
}

export function useNextActions(graph, addMessages) {
  const startNode = graph.nodes[graph.startId];
  const [nextActions, setNextActions] = useState(getNextActions(startNode, graph));

  function takeAction(id) {
    addMessages([{ markup: graph.nodes[id].action, isGuest: true }]);

    setTimeout(() => {
      setNextActions(getNextActions(graph.nodes[id], graph));

      addMessages(
        [{ markup: graph.nodes[id].action, isGuest: true }].concat(graph.nodes[id].messages.map(markup => ({ markup })))
      );
    }, 500);
  }

  return [nextActions, takeAction];
}
