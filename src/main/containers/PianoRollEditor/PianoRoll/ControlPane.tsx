import React, { SFC, useState, useEffect } from "react"
import ControlPane from "main/components/PianoRoll/ControlPane"
import { useStores } from "main/hooks/useStores"
import { useObserver } from "mobx-react"
import { useTheme } from "main/hooks/useTheme"
import { NoteCoordTransform } from "common/transform"
import {
  changeNotesVelocity,
  createVolume,
  createPitchBend,
  createPan,
  createModulation,
  createExpression,
} from "main/actions"
import { createBeatsInRange } from "common/helpers/mapBeats"

export const ControlPaneWrapper: SFC<{}> = () => {
  const { rootStore } = useStores()
  const {
    events,
    endTick,
    measures,
    timebase,
    scaleX,
    scrollLeft,
    controlMode,
  } = useObserver(() => ({
    events: rootStore.song.selectedTrack?.events ?? [],
    endTick: rootStore.song.endOfSong,
    measures: rootStore.song.measures,
    timebase: rootStore.services.player.timebase,
    scaleX: rootStore.pianoRollStore.scaleX,
    scrollLeft: rootStore.pianoRollStore.scrollLeft,
    controlMode: rootStore.pianoRollStore.controlMode,
  }))

  const theme = useTheme()
  const transform = new NoteCoordTransform(0.1 * scaleX, theme.keyHeight, 127)
  const startTick = scrollLeft / transform.pixelsPerTick

  const mappedBeats = createBeatsInRange(
    measures,
    transform.pixelsPerTick,
    timebase,
    startTick,
    endTick
  )

  return (
    <ControlPane
      transform={transform}
      events={events}
      scrollLeft={scrollLeft}
      mode={controlMode}
      theme={theme}
      onSelectTab={(m) => (rootStore.pianoRollStore.controlMode = m)}
      changeVelocity={(notes, velocity) =>
        changeNotesVelocity(rootStore)(
          notes.map((n) => n.id),
          velocity
        )
      }
      createControlEvent={(mode, value, tick) => {
        const action = (() => {
          switch (mode) {
            case "volume":
              return createVolume
            case "pitchBend":
              return createPitchBend
            case "pan":
              return createPan
            case "modulation":
              return createModulation
            case "expression":
              return createExpression
            case "velocity":
              throw new Error("invalid type")
          }
        })()
        action(rootStore)(value, tick || 0)
      }}
      paddingBottom={0}
      beats={mappedBeats}
    />
  )
}
