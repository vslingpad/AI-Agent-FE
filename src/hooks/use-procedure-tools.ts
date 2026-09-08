"use client";

import { useMemo } from "react";
import { useAgentActions } from "@/hooks/use-agents";
import { useCustomToolsHub } from "@/hooks/use-custom-tools";
import type { ProcedureToolOption } from "@/lib/schemas/procedures";

export function useAgentProcedureTools(agentId: string): ProcedureToolOption[] {
  const { data: actions } = useAgentActions(agentId);
  const { data: hub } = useCustomToolsHub();

  return useMemo(() => {
    const customBinding = actions?.actions.find((action) => action.id === "act_custom");
    if (!customBinding || !hub) {
      return [];
    }

    const enabledIds = new Set(
      customBinding.subActions.filter((item) => item.enabled).map((item) => item.id)
    );

    return hub.tools
      .filter((tool) => tool.proceduresEnabled && enabledIds.has(tool.id))
      .map((tool) => ({
        slug: tool.slug,
        name: tool.displayName,
      }));
  }, [actions, hub]);
}
