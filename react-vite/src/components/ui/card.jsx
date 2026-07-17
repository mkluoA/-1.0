import { cn } from '@/lib/utils'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-card text-card-foreground shadow-sm', className)}
      {...props}
     style={props?.style} data-qoder-id={props?.["data-qoder-id"]} data-qoder-source={props?.["data-qoder-source"]}/>
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}  data-qoder-id="qel-div-22575cb1" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-22575cb1&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui/card.jsx&quot;,&quot;componentName&quot;:&quot;CardHeader&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:13,&quot;column&quot;:10}}"/>
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props}  data-qoder-id="qel-h3-a038c18b" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-h3-a038c18b&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui/card.jsx&quot;,&quot;componentName&quot;:&quot;CardTitle&quot;,&quot;elementRole&quot;:&quot;h3&quot;,&quot;loc&quot;:{&quot;line&quot;:17,&quot;column&quot;:10}}"/>
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props}  data-qoder-id="qel-p-0dfe78a4" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-p-0dfe78a4&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui/card.jsx&quot;,&quot;componentName&quot;:&quot;CardDescription&quot;,&quot;elementRole&quot;:&quot;p&quot;,&quot;loc&quot;:{&quot;line&quot;:21,&quot;column&quot;:10}}"/>
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-6 pt-0', className)} {...props}  data-qoder-id="qel-div-3d847624" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-3d847624&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui/card.jsx&quot;,&quot;componentName&quot;:&quot;CardContent&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:25,&quot;column&quot;:10}}"/>
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props}  data-qoder-id="qel-div-99a5e8d3" data-qoder-source="{&quot;qoderId&quot;:&quot;qel-div-99a5e8d3&quot;,&quot;filePath&quot;:&quot;react-vite/src/components/ui/card.jsx&quot;,&quot;componentName&quot;:&quot;CardFooter&quot;,&quot;elementRole&quot;:&quot;div&quot;,&quot;loc&quot;:{&quot;line&quot;:29,&quot;column&quot;:10}}"/>
}
