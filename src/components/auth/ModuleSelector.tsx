import React from "react";

interface ModuleSelectorProps {
  modules: { id: string; name: string; icon: string }[];
  selectedModule: string;
  onSelect: (moduleId: string) => void;
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  modules,
  selectedModule,
  onSelect,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {modules.map((module) => {
        const isActive = selectedModule === module.id;

        return (
          <button
            key={module.id}
            onClick={() => onSelect(module.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
              ${isActive
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50"}
            `}
          >
            <span>{module.icon}</span>
            <span className="text-sm font-medium">{module.name}</span>
          </button>
        );
      })}
    </div>
  );
};