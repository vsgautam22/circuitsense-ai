import React from 'react'
import { Cpu, Activity, Code2, Timer, Bug, Package } from 'lucide-react'

const iconMap = { Cpu, Activity, Code2, Timer, Bug, Package }

export default function ToolSelector({ tools, activeTool, onSelect }) {
  return (
    <div className="flex flex-col gap-1 p-2">
      {tools.map(t => {
        const Icon = iconMap[t.icon] || Cpu
        const isActive = activeTool?.id === t.id
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all duration-150 group
              ${isActive
                ? 'bg-scope-border text-scope-text'
                : 'text-scope-dim hover:bg-scope-panel hover:text-scope-text'
              }`}
          >
            <Icon
              size={15}
              className={`flex-shrink-0 transition-colors ${isActive ? t.color : 'text-scope-muted group-hover:' + t.color}`}
            />
            <span className="font-mono text-xs font-medium truncate">{t.label}</span>
            {isActive && (
              <div className="ml-auto w-1 h-1 rounded-full bg-scope-green pulse-dot" />
            )}
          </button>
        )
      })}
    </div>
  )
}
