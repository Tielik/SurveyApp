import { useEffect, useRef } from "react"
import '@eastdesire/jscolor'

interface JSColorInstance {
  toHEXString: () => string
  fromString: (hex: string) => void
}

interface JSColorOptions {
  value?: string
  format?: 'hex' | 'rgb' | 'rgba'
  previewSize?: number
  borderRadius?: number
  padding?: number
  width?: number
  closeButton?: boolean
  closeText?: string
  onInput?: (this: JSColorInstance) => void
}

declare global {
  interface Window {
    jscolor: new (target: HTMLElement, options: JSColorOptions) => JSColorInstance
  }
}

interface ColorInput extends HTMLInputElement {
  jscolor?: JSColorInstance
}

interface JSColorPickerProps {
  value: string
  onChange: (color: string) => void
}


export const JSColorPicker = ({ value, onChange }: JSColorPickerProps) => {
  const inputRef = useRef<ColorInput>(null)
  const isInitialized = useRef(false)

  const latestOnChange = useRef(onChange)
  const initialValue = useRef(value)

  useEffect(() => {
    latestOnChange.current = onChange
  }, [onChange])

  useEffect(() => {
    const element = inputRef.current
    
    if (!element || isInitialized.current || element.jscolor) {
      return
    }

    const options: JSColorOptions = {
      value: initialValue.current,
      format: 'hex' as const,
      previewSize: 40,
      borderRadius: 4,
      padding: 8,
      width: 200,
      closeButton: true,
      closeText: 'OK',
      onInput: function (this: JSColorInstance) {
        if (latestOnChange.current) {
           latestOnChange.current(this.toHEXString())
        }
      }
    }

    isInitialized.current = true
    
    if (window.jscolor) {
      new window.jscolor(element, options)
    }
  }, []) 

  useEffect(() => {
    const element = inputRef.current
    if (element && element.jscolor && value) {
      const picker = element.jscolor
      if (picker.toHEXString().toLowerCase() !== value.toLowerCase()) {
        picker.fromString(value)
      }
    }
  }, [value])

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        className="w-full h-9 border border-gray-300 rounded-md px-2 font-mono text-xs uppercase cursor-pointer text-center"
      />
    </div>
  )
}