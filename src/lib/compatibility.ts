export interface Component {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  specifications: Record<string, unknown>;
  socketType?: string | null;
  wattage?: number | null;
  image?: string | null;
  isFeatured?: boolean;
}

export interface CompatibilityIssue {
  type: string;
  message: string;
  severity: 'error' | 'warning';
}

const socketCompatibility: Record<string, string[]> = {
  'AM5': ['AM5'],
  'AM4': ['AM4'],
  'LGA1700': ['LGA1700'],
  'LGA1851': ['LGA1851'],
};

const memoryTypeCompatibility: Record<string, string[]> = {
  'DDR5': ['DDR5'],
  'DDR4': ['DDR4'],
};

export function checkCPUCompatibility(
  cpu: Component | null,
  motherboard: Component | null
): CompatibilityIssue | null {
  if (!cpu || !motherboard) return null;

  const cpuSocket = cpu.specifications?.socket as string | undefined;
  const mbSocket = motherboard.specifications?.socket as string | undefined;

  if (!cpuSocket || !mbSocket) return null;

  const compatibleSockets = socketCompatibility[cpuSocket] || [];
  if (!compatibleSockets.includes(mbSocket)) {
    return {
      type: 'CPU',
      message: `El procesador ${cpu.name} (socket ${cpuSocket}) no es compatible con la placa base ${motherboard.name} (socket ${mbSocket})`,
      severity: 'error'
    };
  }

  return null;
}

export function checkRAMCompatibility(
  ram: Component | null,
  motherboard: Component | null
): CompatibilityIssue | null {
  if (!ram || !motherboard) return null;

  const ramType = ram.specifications?.memoryType as string | undefined;
  const mbMemoryType = motherboard.specifications?.memoryType as string | undefined;

  if (!ramType || !mbMemoryType) return null;

  const compatibleTypes = memoryTypeCompatibility[ramType] || [];
  if (!compatibleTypes.includes(mbMemoryType)) {
    return {
      type: 'RAM',
      message: `La memoria ${ram.name} (${ramType}) no es compatible con la placa base ${motherboard.name} (${mbMemoryType})`,
      severity: 'error'
    };
  }

  return null;
}

export function checkCoolerCompatibility(
  cooler: Component | null,
  cpu: Component | null
): CompatibilityIssue | null {
  if (!cooler || !cpu) return null;

  const coolerSockets = cpu.specifications?.sockets as string | undefined;
  const cpuSocket = cpu.specifications?.socket as string | undefined;

  const supportedSockets = coolerSockets || cpuSocket;
  
  if (!supportedSockets) return null;

  const coolerSocket = cooler.specifications?.sockets as string | undefined;
  if (!coolerSocket) return null;

  if (!supportedSockets.includes(coolerSocket)) {
    return {
      type: 'COOLING',
      message: `El cooler ${cooler.name} no es compatible con el socket ${cpuSocket} del procesador ${cpu.name}`,
      severity: 'warning'
    };
  }

  return null;
}

export function checkGPUCompatibility(
  gpu: Component | null,
  pcCase: Component | null
): CompatibilityIssue | null {
  if (!gpu || !pcCase) return null;

  const gpuLength = gpu.specifications?.length as number | undefined;
  const caseMaxLength = pcCase.specifications?.maxGPULength as number | undefined;

  if (!gpuLength || !caseMaxLength) return null;

  if (gpuLength > caseMaxLength) {
    return {
      type: 'GPU',
      message: `La tarjeta gráfica ${gpu.name} (${gpuLength}mm) no cabe en el case ${pcCase.name} (máx. ${caseMaxLength}mm)`,
      severity: 'error'
    };
  }

  return null;
}

export function calculatePowerConsumption(components: Record<string, Component | null>): number {
  let totalPower = 0;

  const cpu = components['CPU'];
  const gpu = components['GPU'];
  const motherboard = components['MOTHERBOARD'];
  const ram = components['RAM'];
  const storage = components['STORAGE'];

  if (cpu?.specifications?.tdp) {
    totalPower += parseInt(cpu.specifications.tdp as string);
  }

  if (gpu?.specifications?.tdp) {
    totalPower += parseInt(gpu.specifications.tdp as string);
  }

  if (motherboard) totalPower += 50;
  if (ram) totalPower += 10;
  if (storage) totalPower += 10;

  return totalPower;
}

export function checkPSUCompatibility(
  psu: Component | null,
  totalPower: number
): CompatibilityIssue | null {
  if (!psu) return null;

  const psuPower = psu.specifications?.power as number | undefined;

  if (!psuPower) return null;

  const recommendedPower = totalPower * 1.5;

  if (psuPower < totalPower) {
    return {
      type: 'PSU',
      message: `La fuente de ${psuPower}W no es suficiente. Se recomienda al menos ${Math.ceil(recommendedPower)}W para este sistema (consumo estimado: ${totalPower}W)`,
      severity: 'error'
    };
  }

  if (psuPower < recommendedPower) {
    return {
      type: 'PSU',
      message: `La fuente de ${psuPower}W es adecuada pero se recomienda una de al menos ${Math.ceil(recommendedPower)}W para mayor estabilidad`,
      severity: 'warning'
    };
  }

  return null;
}

export function validateBuild(components: Record<string, Component | null>): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];

  const cpu = components['CPU'] || null;
  const motherboard = components['MOTHERBOARD'] || null;
  const ram = components['RAM'] || null;
  const gpu = components['GPU'] || null;
  const pcCase = components['CASE'] || null;
  const psu = components['PSU'] || null;
  const cooler = components['COOLING'] || null;

  const cpuIssue = checkCPUCompatibility(cpu, motherboard);
  if (cpuIssue) issues.push(cpuIssue);

  const ramIssue = checkRAMCompatibility(ram, motherboard);
  if (ramIssue) issues.push(ramIssue);

  const coolerIssue = checkCoolerCompatibility(cooler, cpu);
  if (coolerIssue) issues.push(coolerIssue);

  const gpuIssue = checkGPUCompatibility(gpu, pcCase);
  if (gpuIssue) issues.push(gpuIssue);

  if (cpu || gpu) {
    const totalPower = calculatePowerConsumption(components);
    const psuIssue = checkPSUCompatibility(psu, totalPower);
    if (psuIssue) issues.push(psuIssue);
  }

  return issues;
}

export function getCompatibleComponents(
  type: string,
  currentComponent: Component | null,
  allComponents: Record<string, Component[]>
): Component[] {
  if (!currentComponent) {
    return allComponents[type] || [];
  }

  const components = allComponents[type] || [];

  switch (type) {
    case 'MOTHERBOARD': {
      const cpu = currentComponent;
      if (!cpu) return components;
      
      const cpuSocket = cpu.specifications?.socket as string | undefined;
      if (!cpuSocket) return components;

      return components.filter(mb => {
        const mbSocket = mb.specifications?.socket as string | undefined;
        return mbSocket === cpuSocket;
      });
    }

    case 'RAM': {
      const mb = currentComponent;
      if (!mb) return components;

      const mbMemoryType = mb.specifications?.memoryType as string | undefined;
      if (!mbMemoryType) return components;

      return components.filter(ram => {
        const ramType = ram.specifications?.memoryType as string | undefined;
        return ramType === mbMemoryType;
      });
    }

    case 'GPU': {
      const pcCase = currentComponent;
      if (!pcCase) return components;

      const maxLength = pcCase.specifications?.maxGPULength as number | undefined;
      if (!maxLength) return components;

      return components.filter(gpu => {
        const gpuLength = gpu.specifications?.length as number | undefined;
        if (!gpuLength) return true;
        return gpuLength <= maxLength;
      });
    }

    case 'PSU': {
      const totalPower = calculatePowerConsumption({ ['CPU']: allComponents['CPU']?.find(c => c?.specifications?.tdp) || null });
      if (totalPower === 0) return components;

      const recommendedPower = Math.ceil(totalPower * 1.5);

      return components.filter(psu => {
        const psuPower = psu.specifications?.power as number | undefined;
        if (!psuPower) return true;
        return psuPower >= recommendedPower * 0.8;
      });
    }

    default:
      return components;
  }
}